export default class HashTable {
    constructor(size) {
        this.size = size;
        this.storage = [];
        this.hash = function (string) {
            let count = 0;
            for (let i = 0; i < Math.min(string.length, 10); i++) {
                count += string[i].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
            }
            count %= this.size;
            return count;
        };
        this.push = function (string) {
            const hash = this.hash(string);
            if (this.storage[hash] === undefined) {
                this.storage[hash] = [string];
            }
            else if (!this.storage[hash].includes(string)) {
                this.storage[hash].push(string);
            }
        };
        this.includes = function (string) {
            const hash = this.hash(string);
            return (this.storage[hash] !== undefined && this.storage[hash].includes(string));
        };
    }
}
 