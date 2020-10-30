require('dotenv').config();

import Debug from 'debug';
import { gql } from 'apollo-boost';
import Chance from 'chance';
import { check } from './check';
import { client } from './client';

const chance = new Chance();
const debug = Debug('deepcase-mp:test');

const DELAY = +process.env.DELAY || 0;
const delay = time => new Promise(res => setTimeout(res, time));

const itDelay = () => {
  if (DELAY) {
    it('delay', async () => {
      await delay(DELAY);
    });
  }
};

const insertNode = async () => {
  const result = await client.mutate({ mutation: gql`mutation InsertNode {
    insert_nodes(objects: {}) { returning { id } }
  }` });
  const id = result?.data?.insert_nodes?.returning?.[0]?.id;
  debug(`insert node #${id}`);
  return id;
};
const insertNodes = async (nodes) => {
  const result = await client.mutate({ mutation: gql`mutation InsertNodes($objects: [nodes_insert_input!]!) {
    insert_nodes(objects: $objects) { returning { id } }
  }`, variables: { objects: nodes } });
  const returning = result?.data?.insert_nodes?.returning || [];
  const ids = returning.map(({id}) => id);
  debug(`insert nodes ${ids.length}`);
  return ids;
};
const insertLink = async (fromId: number, toId: number) => {
  const result = await client.mutate({ mutation: gql`mutation InsertLink($fromId: Int, $toId: Int) {
    insert_nodes(objects: { from_id: $fromId, to_id: $toId }) { returning { id } }
  }`, variables: { fromId, toId } });
  const id = result?.data?.insert_nodes?.returning?.[0]?.id;
  debug(`insert link #${id} (#${fromId} -> #${toId})`);
  return id;
};
const clear = async () => {
  await client.mutate({ mutation: gql`mutation Clear {
    delete_nodes(where: {}) { affected_rows }
    delete_nodes__mp(where: {}) { affected_rows }
  }
  ` });
  debug(`clear`);
};
const deleteNode = async (id: number) => {
  const result = await client.mutate({ mutation: gql`mutation DeleteNode($id: Int) {
    delete_nodes(where: { id: { _eq: $id } }) { returning { id } }
  }`, variables: { id } });
  debug(`delete node #${id}`);
  return result?.data?.delete_nodes?.returning?.[0]?.id;
};

const generateTree = (initialId, count = 1000) => {
  let i = initialId + 1;
  const paths = { [initialId]: [initialId] };
  const array: any[] = [{ id: initialId }];
  // const variants = [['node', 'link'], [5, 1]];
  for (let c = 0; c < count; c++) {
    const s = chance.integer({ min: 0, max: array.length - 1 });
    // const v = chance.weighted(...variants);
    array.push({ id: i + 0 }, { id: i + 1, from_id: array[s].id, to_id: i + 0 });
    paths[i + 0] = paths[array[s].id] ? [...paths[array[s].id], array[s].id, i + 0] : [array[s].id, i + 0];
    i = i + 2;
  }
  array.shift();
  return { array, paths };
};

beforeAll(async () => {
  jest.setTimeout(100000);
});

// it('+1', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   await check({ a, b });
// });
// itDelay();
// it('-1', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   await deleteNode(a);
//   await check({ a, b });
// });
// itDelay();
// it('+2', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   await check({ a, b, c });
// });
// itDelay();
// it('-2', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   await deleteNode(c);
//   await check({ a, b, c });
// });
// itDelay();
// it('+3', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   await check({ a, b, c, d, e });
// });
// itDelay();
// it('-3', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   await deleteNode(e);
//   await check({ a, b, c, d, e });
// });
// itDelay();
// it('+4', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   const x = await insertNode();
//   const y = await insertLink(x, a);
//   await check({ a, b, c, d, e, x, y });
// });
// itDelay();
// it('-4', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   const x = await insertNode();
//   const y = await insertLink(x, a);
//   await deleteNode(y);
//   await check({ a, b, c, d, e, x, y });
// });
// itDelay();
// it('+5', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   const x = await insertNode();
//   const y = await insertLink(x, b);
//   await check({ a, b, c, d, e, x, y });
// });
// itDelay();
// it('-5', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   const x = await insertNode();
//   const y = await insertLink(x, b);
//   await deleteNode(y);
//   await check({ a, b, c, d, e, x, y });
// });
// itDelay();
// it('+7', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   const y = await insertLink(a, d);
//   await check({ a, b, c, d, e, y });
// });
// itDelay();
// it('-7', async () => {
//   await clear();
//   const a = await insertNode();
//   const b = await insertNode();
//   const c = await insertLink(a, b);
//   const d = await insertNode();
//   const e = await insertLink(b, d);
//   const y = await insertLink(a, d);
//   await deleteNode(y);
//   await check({ a, b, c, d, e, y });
// });
// itDelay();
it('tree', async () => {
  await clear();
  const a = await insertNode();
  const { array } = generateTree(a, 10000);
  const ids = await insertNodes(array);
  const ns = {};
  for (let d = 0; d < ids.length; d++) ns[ids[d]] = ids[d];
  await check({ a, ...ns });
});