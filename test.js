const list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

function chunkMaxLength(arr, chunkSize, maxLength) {
	return Array.from({length: maxLength}, () => arr.splice(0, chunkSize));
}

console.log(chunkMaxLength(list, 7, 3));
