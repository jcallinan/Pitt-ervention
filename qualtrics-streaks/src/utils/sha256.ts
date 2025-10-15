const INITIAL_HASH: number[] = [
  0x6a09e667,
  0xbb67ae85,
  0x3c6ef372,
  0xa54ff53a,
  0x510e527f,
  0x9b05688c,
  0x1f83d9ab,
  0x5be0cd19
];

const ROUND_CONSTANTS: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

const rotateRight = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));

const toUtf8Bytes = (input: string): number[] => {
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(input));
  }
  const encoded = encodeURIComponent(input);
  const bytes: number[] = [];
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded.charAt(i);
    if (char === "%" && i + 2 < encoded.length) {
      bytes.push(parseInt(encoded.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }
  return bytes;
};

export const sha256 = (message: string): string => {
  const bytes = toUtf8Bytes(message);
  const bitLength = bytes.length * 8;

  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }

  const bitLengthBig = BigInt(bitLength);
  for (let i = 7; i >= 0; i--) {
    bytes.push(Number((bitLengthBig >> BigInt(i * 8)) & 0xffn));
  }

  const words = new Uint32Array(bytes.length / 4);
  for (let i = 0; i < words.length; i++) {
    words[i] =
      (bytes[i * 4] << 24) |
      (bytes[i * 4 + 1] << 16) |
      (bytes[i * 4 + 2] << 8) |
      bytes[i * 4 + 3];
  }

  const hash = INITIAL_HASH.slice();

  for (let offset = 0; offset < words.length; offset += 16) {
    const schedule = new Uint32Array(64);
    for (let t = 0; t < 16; t++) {
      schedule[t] = words[offset + t];
    }
    for (let t = 16; t < 64; t++) {
      const s0 =
        rotateRight(schedule[t - 15], 7) ^
        rotateRight(schedule[t - 15], 18) ^
        (schedule[t - 15] >>> 3);
      const s1 =
        rotateRight(schedule[t - 2], 17) ^
        rotateRight(schedule[t - 2], 19) ^
        (schedule[t - 2] >>> 10);
      schedule[t] = (schedule[t - 16] + s0 + schedule[t - 7] + s1) >>> 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (let t = 0; t < 64; t++) {
      const S1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + ROUND_CONSTANTS[t] + schedule[t]) >>> 0;
      const S0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }

  return hash.map((value) => value.toString(16).padStart(8, "0")).join("");
};

export default sha256;
