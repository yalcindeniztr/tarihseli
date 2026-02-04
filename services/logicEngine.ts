
export const calculateDigitsSum = (year: number): number => {
  return year.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
};

export const processRiddleLogic = (year: number, logic: string): number => {
  const sum = calculateDigitsSum(year);
  
  // Simple parser for pre-defined logic patterns
  if (logic === '(rakam_toplamı * 2)') return sum * 2;
  if (logic === '(rakam_toplamı * 3)') return sum * 3;
  if (logic === '(rakam_toplamı + 5)') return sum + 5;
  if (logic === '(rakam_toplamı * 4)') return sum * 4;
  if (logic === '(rakam_toplamı - 5)') return sum - 5;
  
  return sum;
};

export const validateAnswer = (userInput: string, node: { correctYear: number }): boolean => {
  return parseInt(userInput.trim()) === node.correctYear;
};
