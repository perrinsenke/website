/**
 * Feed-forward Neural Network class (matrix-free) for creature AI.
 */
export class Brain {
  constructor(inputCount, hiddenCount, outputCount) {
    this.inputCount = inputCount;
    this.hiddenCount = hiddenCount;
    this.outputCount = outputCount;

    // Weights from input to hidden (hiddenCount x inputCount)
    this.weightsIH = Array.from({ length: this.hiddenCount }, () =>
      Array.from({ length: this.inputCount }, () => Math.random() * 2 - 1)
    );

    // Biases for hidden layer
    this.biasH = Array.from({ length: this.hiddenCount }, () => Math.random() * 2 - 1);

    // Weights from hidden to output (outputCount x hiddenCount)
    this.weightsHO = Array.from({ length: this.outputCount }, () =>
      Array.from({ length: this.hiddenCount }, () => Math.random() * 2 - 1)
    );

    // Biases for output layer
    this.biasO = Array.from({ length: this.outputCount }, () => Math.random() * 2 - 1);
  }

  /**
   * Tanh activation function maps values to [-1, 1].
   */
  static tanh(x) {
    return Math.tanh(x);
  }

  /**
   * Compute output values based on sensory inputs.
   */
  feedForward(inputs) {
    if (inputs.length !== this.inputCount) {
      throw new Error(`Input count mismatch. Expected ${this.inputCount}, got ${inputs.length}`);
    }

    // 1. Calculate Hidden Layer activations
    const hidden = [];
    for (let i = 0; i < this.hiddenCount; i++) {
      let sum = this.biasH[i];
      for (let j = 0; j < this.inputCount; j++) {
        sum += inputs[j] * this.weightsIH[i][j];
      }
      hidden.push(Brain.tanh(sum));
    }

    // 2. Calculate Output Layer activations
    const outputs = [];
    for (let i = 0; i < this.outputCount; i++) {
      let sum = this.biasO[i];
      for (let j = 0; j < this.hiddenCount; j++) {
        sum += hidden[j] * this.weightsHO[i][j];
      }
      outputs.push(Brain.tanh(sum));
    }

    return outputs;
  }

  /**
   * Mutate weights and biases slightly.
   * @param {number} rate - Probability of mutation per value (0 to 1).
   * @param {number} amount - Maximum perturbation offset.
   */
  mutate(rate = 0.1, amount = 0.2) {
    const mutateVal = (val) => {
      if (Math.random() < rate) {
        // Standard Gaussian approximation using box-muller
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); 
        while(v === 0) v = Math.random();
        const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        
        return Math.max(-1, Math.min(1, val + num * amount));
      }
      return val;
    };

    this.weightsIH = this.weightsIH.map(row => row.map(mutateVal));
    this.biasH = this.biasH.map(mutateVal);
    this.weightsHO = this.weightsHO.map(row => row.map(mutateVal));
    this.biasO = this.biasO.map(mutateVal);
  }

  /**
   * Deep copy of the brain.
   */
  clone() {
    const clone = new Brain(this.inputCount, this.hiddenCount, this.outputCount);
    clone.weightsIH = this.weightsIH.map(row => [...row]);
    clone.biasH = [...this.biasH];
    clone.weightsHO = this.weightsHO.map(row => [...row]);
    clone.biasO = [...this.biasO];
    return clone;
  }
}
