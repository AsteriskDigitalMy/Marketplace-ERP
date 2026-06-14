export function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function randomDelay(min = 300, max = 700): Promise<void> {
  return delay(min + Math.floor(Math.random() * (max - min)))
}
