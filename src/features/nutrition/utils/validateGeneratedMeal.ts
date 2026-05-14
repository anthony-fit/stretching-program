export interface MealValidationResult {
  confidenceScore: number;
  warnings: string[];
}

export function validateGeneratedMeal(
  recipe: any,
  targets: { targetCalories: number; targetProtein: number; targetCarbs: number; targetFat: number }
): MealValidationResult {
  const warnings: string[] = [];
  let confidenceScore = 100;

  if (!recipe || !recipe.title) {
    return { confidenceScore: 0, warnings: ['Invalid recipe structure'] };
  }

  const allText = `${recipe.title} ${recipe.ingredients?.join(' ')} ${recipe.tags?.join(' ')}`.toLowerCase();

  // Basic deterministic checks
  // If target protein is high (>30g) and missing typical high protein keywords
  if (targets.targetProtein > 30) {
    const highProteinWords = ['chicken', 'beef', 'steak', 'tofu', 'protein', 'eggs', 'salmon', 'tuna', 'turkey', 'pork', 'yogurt', 'whey'];
    if (!highProteinWords.some(w => allText.includes(w))) {
      warnings.push('May be low in protein based on ingredients.');
      confidenceScore -= 20;
    }
  }

  // If low fat targets (<15g) but heavy fat keywords present
  if (targets.targetFat < 15) {
    const highFatWords = ['butter', 'heavy cream', 'bacon', 'deep fried', 'cheese sauce', 'mayo'];
    if (highFatWords.some(w => allText.includes(w))) {
      warnings.push('Contains ingredients typically high in fat.');
      confidenceScore -= 20;
    }
  }

  // Low carb check
  if (targets.targetCarbs < 30) {
    const highCarbWords = ['pasta', 'bread', 'rice', 'potato', 'sugar', 'syrup', 'honey'];
    if (highCarbWords.some(w => allText.includes(w))) {
      warnings.push('Contains high-carb ingredients despite low carb target.');
      confidenceScore -= 20;
    }
  }

  return { confidenceScore, warnings };
}
