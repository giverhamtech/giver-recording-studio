import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';

const tableCache = new Map();
const channels = new Map();

const TABLE_FALLBACKS = {
	beats: ['songs', 'beats'],
	songs: ['songs'],
	categories: ['categories'],
	productions: ['productions'],
	artistSubmissions: ['artist_uploads', 'artistSubmissions', 'submissions'],
	founderProfile: ['founder_profile', 'founderProfile'],
	services: ['services'],
	booking_requests: ['bookings', 'booking_requests'],
	bookings: ['bookings', 'booking_requests'],
	contact_messages: ['contact_messages'],
	email_leads: ['email_leads']
};

const nowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const parseBoolean = (value) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		if (value.toLowerCase() === 'true') return true;
		if (value.toLowerCase() === 'false') return false;
	}
	return value;
};

const normalizeSongRecord = (record) => {
	if (!record || typeof record !== 'object') return record;
	return {
		...record,
		mp3_file: record.mp3_file || record.audioFile || null,
		is_featured: Boolean(record.is_featured),
		created: record.created || record.created_at || null
	};
};

const mapOutgoing = (collectionName, payload) => {
	const mapped = { ...payload };

	if (collectionName === 'beats') {
		if (mapped.mp3_file && !mapped.audioFile) {
			mapped.audioFile = mapped.mp3_file;
		}
		delete mapped.mp3_file;
	}

	if (collectionName === 'productions') {
		if (mapped.audioFile !== undefined) mapped.audio_file = mapped.audioFile;
		if (mapped.coverImage !== undefined) mapped.cover_image = mapped.coverImage;
		if (mapped.videoUrl !== undefined) mapped.video_url = mapped.videoUrl;
		if (mapped.displayOrder !== undefined) mapped.display_order = mapped.displayOrder;
		if (mapped.privacy !== undefined && mapped.visibility === undefined) mapped.visibility = mapped.privacy;

		delete mapped.audioFile;
		delete mapped.coverImage;
		delete mapped.videoUrl;
		delete mapped.displayOrder;
		delete mapped.privacy;
	}

	if (collectionName === 'artistSubmissions') {
		if (mapped.artistName !== undefined) mapped.artist_name = mapped.artistName;
		if (mapped.songTitle !== undefined) mapped.title = mapped.songTitle;
		if (mapped.genre !== undefined) mapped.category = mapped.genre;
		if (mapped.audioFile !== undefined) mapped.audio_file = mapped.audioFile;
		if (mapped.coverImage !== undefined) mapped.cover_image = mapped.coverImage;

		if (mapped.instagramHandle) {
			const baseMessage = mapped.message ? String(mapped.message) : '';
			mapped.message = baseMessage
				? `${baseMessage}\nInstagram: ${mapped.instagramHandle}`
				: `Instagram: ${mapped.instagramHandle}`;
		}

		delete mapped.artistName;
		delete mapped.songTitle;
		delete mapped.genre;
		delete mapped.audioFile;
		delete mapped.coverImage;
		delete mapped.instagramHandle;
	}

	if (collectionName === 'booking_requests' || collectionName === 'bookings') {
		if (mapped.name !== undefined) mapped.client_name = mapped.name;
		if (mapped.status === undefined) mapped.status = 'pending';
		delete mapped.name;
	}

	if (collectionName === 'contact_messages') {
		if (mapped.status === undefined) mapped.status = 'unread';
	}

	return mapped;
};

const mapIncoming = (collectionName, record) => {
	if (collectionName === 'beats') return normalizeSongRecord(record);
	if (collectionName === 'productions' && record && typeof record === 'object') {
		return {
			...record,
			audioFile: record.audioFile ?? record.audio_file ?? null,
			coverImage: record.coverImage ?? record.cover_image ?? null,
			videoUrl: record.videoUrl ?? record.video_url ?? null,
			displayOrder: record.displayOrder ?? record.display_order ?? 0,
			privacy: record.privacy ?? record.visibility ?? 'public',
			visibility: record.visibility ?? record.privacy ?? 'public',
			created: record.created ?? record.created_at ?? null
		};
	}
	if (collectionName === 'artistSubmissions' && record && typeof record === 'object') {
		return {
			...record,
			artistName: record.artistName ?? record.artist_name ?? '',
			songTitle: record.songTitle ?? record.title ?? '',
			genre: record.genre ?? record.category ?? '',
			audioFile: record.audioFile ?? record.audio_file ?? null,
			coverImage: record.coverImage ?? record.cover_image ?? null,
			created: record.created ?? record.created_at ?? null
		};
	}
	if ((collectionName === 'booking_requests' || collectionName === 'bookings') && record && typeof record === 'object') {
		return {
			...record,
			name: record.name ?? record.client_name ?? '',
			created: record.created ?? record.created_at ?? null,
			status: record.status ?? 'pending'
		};
	}
	return record;
};

const inferBucket = (fieldName, fileName) => {
	const key = `${fieldName || ''} ${fileName || ''}`.toLowerCase();
	if (key.includes('audio') || key.includes('mp3') || key.includes('wav') || key.includes('m4a')) return 'song-files';
	if (key.includes('avatar') || key.includes('founder')) return 'avatars';
	return 'cover-images';
};

const sanitizeFileName = (name) => (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');

const formDataToObject = async (formData) => {
	const out = {};

	for (const [key, value] of formData.entries()) {
		if (value instanceof File) {
			const bucket = inferBucket(key, value.name);
			const path = `uploads/${key}/${nowId()}-${sanitizeFileName(value.name)}`;
			const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, value, { upsert: false });
			if (uploadErr) throw uploadErr;
			out[key] = path;
			continue;
		}

		out[key] = parseBoolean(value);
	}

	return out;
};

const parseFilter = (filter) => {
	if (!filter || typeof filter !== 'string') return [];
	return filter
		.split('&&')
		.map((part) => part.trim())
		.filter(Boolean)
		.map((expr) => {
			const neq = expr.includes('!=');
			const [left, right] = expr.split(neq ? '!=' : '=').map((v) => v.trim());
			if (!left || right === undefined) return null;
			let value = right;
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			value = parseBoolean(value);
			return { field: left, op: neq ? 'neq' : 'eq', value };
		})
		.filter(Boolean);
};

const applyFilter = (rows, filter) => {
	const rules = parseFilter(filter);
	if (rules.length === 0) return rows;

	return rows.filter((row) =>
		rules.every((rule) => {
			const rowValue = row?.[rule.field];
			if (rule.op === 'neq') return rowValue !== rule.value;
			return rowValue === rule.value;
		})
	);
};

const applySort = (rows, sort) => {
	if (!sort) return rows;
	const isDesc = sort.startsWith('-');
	const field = isDesc ? sort.slice(1) : sort;
	const mappedField = field === 'created' ? 'created_at' : field;

	return [...rows].sort((a, b) => {
		const av = a?.[mappedField];
		const bv = b?.[mappedField];
		if (av == null && bv == null) return 0;
		if (av == null) return 1;
		if (bv == null) return -1;
		if (av > bv) return isDesc ? -1 : 1;
		if (av < bv) return isDesc ? 1 : -1;
		return 0;
	});
};

const attachExpand = async (collectionName, rows, expand) => {
	if (!expand || expand !== 'category') return rows;
	if (!['songs', 'beats'].includes(collectionName)) return rows;

	const { data: categories } = await supabase.from('categories').select('*');
	const categoryById = new Map((categories || []).map((cat) => [cat.id, cat]));

	return rows.map((row) => ({
		...row,
		expand: {
			...(row.expand || {}),
			category: categoryById.get(row.category) || null
		}
	}));
};

const resolveTable = async (collectionName) => {
	if (tableCache.has(collectionName)) return tableCache.get(collectionName);

	const candidates = TABLE_FALLBACKS[collectionName] || [collectionName];
	for (const table of candidates) {
		const { error } = await supabase.from(table).select('*').limit(1);
		if (!error) {
			tableCache.set(collectionName, table);
			return table;
		}
	}

	tableCache.set(collectionName, candidates[0]);
	return candidates[0];
};

const listRecords = async (collectionName, options = {}) => {
	const table = await resolveTable(collectionName);
	const { data, error } = await supabase.from(table).select('*');
	if (error) throw error;

	let rows = (data || []).map((row) => mapIncoming(collectionName, row));
	rows = applyFilter(rows, options.filter);
	rows = applySort(rows, options.sort);
	rows = await attachExpand(collectionName, rows, options.expand);
	return rows;
};

const createCollectionApi = (collectionName) => ({
	async getFullList(options = {}) {
		return listRecords(collectionName, options);
	},

	async getList(page = 1, perPage = 50, options = {}) {
		const rows = await listRecords(collectionName, options);
		const p = Number(page) || 1;
		const size = Number(perPage) || 50;
		const start = (p - 1) * size;
		const end = start + size;
		return {
			page: p,
			perPage: size,
			totalItems: rows.length,
			totalPages: Math.max(1, Math.ceil(rows.length / size)),
			items: rows.slice(start, end)
		};
	},

	async getOne(id) {
		const table = await resolveTable(collectionName);
		const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
		if (error) throw error;
		if (!data) throw new Error(`Record not found: ${id}`);
		return mapIncoming(collectionName, data);
	},

	async getFirstListItem(filter, options = {}) {
		const rows = await listRecords(collectionName, { ...options, filter });
		if (!rows.length) throw new Error('No matching record found');
		return rows[0];
	},

	async create(payload) {
		const table = await resolveTable(collectionName);
		const source = payload instanceof FormData ? await formDataToObject(payload) : payload;
		const mapped = mapOutgoing(collectionName, source || {});

		const { data, error } = await supabase.from(table).insert(mapped).select('*').single();
		if (error) throw error;
		return mapIncoming(collectionName, data);
	},

	async update(id, payload) {
		const table = await resolveTable(collectionName);
		const source = payload instanceof FormData ? await formDataToObject(payload) : { ...(payload || {}) };

		for (const key of Object.keys(source)) {
			if (key.endsWith('+')) {
				const baseKey = key.slice(0, -1);
				const { data: current } = await supabase.from(table).select(baseKey).eq('id', id).maybeSingle();
				const currentValue = Number(current?.[baseKey]) || 0;
				source[baseKey] = currentValue + Number(source[key] || 0);
				delete source[key];
			}
		}

		const mapped = mapOutgoing(collectionName, source);
		const { data, error } = await supabase
			.from(table)
			.update(mapped)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw error;
		return mapIncoming(collectionName, data);
	},

	async delete(id) {
		const table = await resolveTable(collectionName);
		const { error } = await supabase.from(table).delete().eq('id', id);
		if (error) throw error;
		return true;
	},

	subscribe(topic, callback) {
		const key = `${collectionName}:${topic}`;
		if (channels.has(key)) return;

		resolveTable(collectionName).then((table) => {
			const channel = supabase
				.channel(`legacy-${key}-${nowId()}`)
				.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
					callback?.(payload);
				})
				.subscribe();

			channels.set(key, channel);
		});
	},

	unsubscribe(topic) {
		const key = `${collectionName}:${topic}`;
		const channel = channels.get(key);
		if (!channel) return;
		supabase.removeChannel(channel);
		channels.delete(key);
	}
});

const pb = {
	collection(name) {
		return createCollectionApi(name);
	},
	files: {
		getURL(_record, fileValue) {
			if (!fileValue) return null;
			if (typeof fileValue === 'string' && /^(https?:\/\/|data:|blob:)/i.test(fileValue)) return fileValue;
			const value = String(fileValue);
			const bucket = inferBucket('', value);
			return getPublicStorageUrl({ bucket, path: value });
		}
	}
};

export default pb;

