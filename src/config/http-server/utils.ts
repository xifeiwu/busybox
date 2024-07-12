import path from 'path';

export const uploadDirOnHome = path.resolve(process.env.HOME, 'uploads');
export const uploadDirOnCwd = path.resolve(process.cwd(), 'uploads');
