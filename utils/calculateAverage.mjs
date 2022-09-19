export default function calculateAverage(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
