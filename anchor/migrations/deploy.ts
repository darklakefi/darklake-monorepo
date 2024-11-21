import { deploy } from './setup';

module.exports = async function (provider) {
  console.log('Migrating');

  const network = process.env.NETWORK || 'devnet';

  if (process.env.UPGRADE === 'true') {
    console.log('Not implementated due to deprication');
    return;
  }

  await deploy(provider, network);
};
