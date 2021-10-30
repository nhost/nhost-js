import { NhostClient } from '../src/index';

const BACKEND_URL = 'http://localhost:1337';

const nhost = new NhostClient({
  backendUrl: BACKEND_URL,
});

test('getUrl()', async () => {
  let graphqlUrl = await nhost.graphql.getUrl();

  expect(graphqlUrl).toBe('http://localhost:1337/v1/graphql');
});

test('GraphQL request as logged out user', async () => {
  const document = `
query {
  users {
    id
    displayName
  }
}
  `;
  let { data, error } = await nhost.graphql.request(document);

  expect(error).toBeTruthy();
  expect(data).toBeNull();
});

test('GraphQL request as admin', async () => {
  const document = `
query {
  users {
    id
    displayName
  }
}
  `;
  let { data, error } = await nhost.graphql.request(
    document,
    {},
    {
      headers: {
        'x-hasura-admin-secret': 'nhost-admin-secret',
      },
    }
  );

  expect(error).toBeNull();
  expect(data).toBeTruthy();
});

test('GraphQL with variables', async () => {
  const document = `
query ($id: uuid!) {
  user (id: $id) {
    id
    displayName
  }
}
  `;
  let { data, error } = await nhost.graphql.request(
    document,
    {
      id: '5ccdb471-8ab2-4441-a3d1-f7f7146dda0c',
    },
    {
      headers: {
        'x-hasura-admin-secret': 'nhost-admin-secret',
      },
    }
  );

  expect(error).toBeNull();
  expect(data).toBeTruthy();
});

test('GraphQL with incorrect variables', async () => {
  const document = `
query ($id: uuid!) {
  user (id: $id) {
    id
    displayName
  }
}
  `;
  let { data, error } = await nhost.graphql.request(
    document,
    {
      id: 'not-a-uuid',
    },
    {
      headers: {
        'x-hasura-admin-secret': 'nhost-admin-secret',
      },
    }
  );

  expect(error).toBeTruthy();
  expect(data).toBeNull();
});

test('GraphQL with missing variables', async () => {
  const document = `
query ($id: uuid!) {
  user (id: $id) {
    id
    displayName
  }
}
  `;
  let { data, error } = await nhost.graphql.request(
    document,
    {},
    {
      headers: {
        'x-hasura-admin-secret': 'nhost-admin-secret',
      },
    }
  );

  expect(error).toBeTruthy();
  expect(data).toBeNull();
});
