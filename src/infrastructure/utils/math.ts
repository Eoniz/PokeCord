export const median = (...numbers: number[]): number => {
    let median = 0;
    let numsLen = numbers.length;
    numbers.sort();

    median = (numsLen % 2 === 0) ? (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2 : numbers[(numsLen - 1) / 2];
 
    return median;
}