// @ts-expect-error missing implementation
const getRandomNumber = (number) => {
    return Math.floor(1 + Math.random() * number);
};

let result = getRandomNumber(1000);

console.log(result);