export const sleep = async t => new Promise(resolve => setTimeout(resolve, t));

export const delayReturn = (v, t) => async () => {
  await sleep(t);
  return v;
};

export const progressReturn = (v, t) => async (updater) => {
  const step = t / 100;
  for (let i = 0; i < 100; ++i) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(step);
    updater(i / 100);
  }
  return v;
};