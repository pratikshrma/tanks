export const randomSign = (): number => {
	return Math.random() < 0.5 ? -1 : 1;
};

export const randomIntInRange = (min: number, max: number): number => {
	return Math.random() * (max - min + 1) + min;
};
