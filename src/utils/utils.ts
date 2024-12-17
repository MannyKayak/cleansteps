import Settings from "../settings.json" assert { type: "json" };

function sessionId(): string {
  let id = "";
  const asciiZero = "0".charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

function splitArray<T>(array: T[], segmentLength: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += segmentLength) {
    result.push(array.slice(i, i + segmentLength));
  }
  return result;
}

function generateRandomStartingPoint(): number {
  // Generate random number between 0 and 63
  const index = Math.floor(Math.random() * 64);
  // round the index to the nearest 8 multiple -1
  return Math.floor(index / 8) * 8 + 7;
}

const blankCanvas = new Array(Settings.resolution * Settings.resolution).fill(
  0
);

function generateRandomFinishPoint(): number {
  const index = Math.floor(Math.random() * 64);
  return Math.floor(index / 8) * 8;
}

function generatePossibleMovements(position: number): number[] {
  const movements: number[] = [];

  const row = Math.floor(position / 8);
  const col = position % 8;

  // Controlla se il movimento è consentito e non supera i bordi
  if (row > 0 && col > 0) movements.push(position - 9); // Alto sinistra
  if (row > 0) movements.push(position - 8); // Alto
  if (row > 0 && col < 7) movements.push(position - 7); // Alto destra
  if (col > 0) movements.push(position - 1); // Sinistra
  if (col < 7) movements.push(position + 1); // Destra
  if (row < 7 && col > 0) movements.push(position + 7); // Basso sinistra
  if (row < 7) movements.push(position + 8); // Basso
  if (row < 7 && col < 7) movements.push(position + 9); // Basso destra

  return movements;
}

export {
  sessionId,
  splitArray,
  blankCanvas,
  generateRandomStartingPoint,
  generateRandomFinishPoint,
  generatePossibleMovements,
};
