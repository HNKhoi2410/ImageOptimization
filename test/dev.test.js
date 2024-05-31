import { describe, expect, it } from 'vitest'
import { main } from '../src/dev'

describe("Happy case", () => {
  it('renders correctly', async () => {
    const request = new Request(
      'https://rc-assets.kaligo-staging.xyz/images-proxy/products/fresh-tasty-sandwich.jpg?width=150&height=150&fit=contain&dummy=dummy&dpr=1',
    );
    const response = await main(request);
    const body = await response.json();

    expect(body).toEqual(
      [
        'https://rc-assets.kaligo-staging.xyz/images/products/fresh-tasty-sandwich.jpg',
        {
          cf: {
            image: {
              width: '150',
              height: '150',
              fit: 'contain',
              dpr: '1',
            }
          }
        }
      ]
    )
  });
});
