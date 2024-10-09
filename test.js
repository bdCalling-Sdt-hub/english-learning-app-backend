(async () => {
    const stripe = require('stripe')('sk_test_51Q6nR92LZOEqC8MeWGXjg2bIBhFLkms1rUPAIumJwZHGZd6POrz5B1yFZGoNQ9TEnw5OtVGE5yq9RYjcwucTgfAi00tVo7w6V6');

const capability = await stripe.accounts.retrieveCapability(
  'acct_1Q7yPYRwHUgYZulf',
  'transfers'
);

console.log(capability);
})()
