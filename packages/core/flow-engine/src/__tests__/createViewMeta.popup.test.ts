/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { describe, it, expect, vi } from 'vitest';
import { FlowContext } from '../flowContext';
import { FlowEngine } from '../flowEngine';
import type { FlowView } from '../views/FlowView';
import { createPopupMeta } from '../views/createViewMeta';

describe('createViewMeta - popup variables', () => {
  function makeCtx() {
    const engine = new FlowEngine();
    const ctx = new FlowContext();
    ctx.defineProperty('engine', { value: engine });
    // 简化 i18n：直接返回 key
    ctx.defineProperty('t', { value: (s: string) => s });
    return { engine, ctx };
  }

  it('buildVariablesParams(record) uses anchor view instead of ctx.view', async () => {
    const { engine, ctx } = makeCtx();

    // 模拟锚定弹窗视图（被测试目标）
    const anchorView: FlowView = {
      type: 'embed',
      inputArgs: {},
      Header: null,
      Footer: null,
      close: () => void 0,
      update: () => void 0,
      navigation: {
        viewStack: [
          {
            viewUid: 'popup-uid',
            filterByTk: 111,
            sourceId: 42,
          },
        ],
      } as any,
    } as any;

    // ctx.view 指向另一个（例如设置弹窗）
    ctx.defineProperty('view', {
      value: {
        type: 'dialog',
        inputArgs: {},
        navigation: {
          viewStack: [
            {
              viewUid: 'settings-uid',
              filterByTk: 9999,
            },
          ],
        },
      },
    });

    // 为两个视图 uid 注入不同的 openView 配置，确保只取锚定视图
    const popupModel = {
      getStepParams: vi.fn((_fk: string, sk: string) =>
        sk === 'openView'
          ? {
              collectionName: 'posts',
              dataSourceKey: 'main',
            }
          : undefined,
      ),
    } as any;
    const settingsModel = {
      getStepParams: vi.fn((_fk: string, sk: string) =>
        sk === 'openView'
          ? {
              collectionName: 'comments',
              dataSourceKey: 'main',
            }
          : undefined,
      ),
    } as any;

    const getModelSpy = vi.spyOn(engine as any, 'getModel');
    getModelSpy.mockImplementation((uid: string) => (uid === 'popup-uid' ? popupModel : settingsModel));

    const metaFactory = createPopupMeta(ctx, anchorView);
    const meta = (await metaFactory())!;

    // record 应来自锚定视图的 openView 配置
    const vars = (await meta.buildVariablesParams!(ctx)) as any;
    expect(vars).toBeTruthy();
    expect(vars.record).toEqual({ collection: 'posts', dataSourceKey: 'main', filterByTk: 111 });

    // 确认没有误用 ctx.view（settings-uid）的集合
    expect(vars.record.collection).not.toBe('comments');
  });

  it('properties() provides a record factory node (lazy) with title', async () => {
    const { engine, ctx } = makeCtx();
    // 只要能通过 anchorView 推断到集合名和主键即可；集合详情在懒加载时再取
    const anchorView: FlowView = {
      type: 'embed',
      inputArgs: {},
      Header: null,
      Footer: null,
      close: () => void 0,
      update: () => void 0,
      navigation: { viewStack: [{ viewUid: 'popup-uid', filterByTk: 1 }] } as any,
    } as any;
    const popupModel = {
      getStepParams: vi.fn((_fk: string, sk: string) =>
        sk === 'openView'
          ? {
              collectionName: 'tasks',
              dataSourceKey: 'main',
            }
          : undefined,
      ),
    } as any;
    vi.spyOn(engine as any, 'getModel').mockImplementation(() => popupModel);

    const meta = (await createPopupMeta(ctx, anchorView)())!;
    const props = typeof meta.properties === 'function' ? await (meta.properties as any)() : meta.properties || {};
    // 断言存在 record 节点工厂，且有标题（懒加载，不触发集合访问）
    expect(typeof props.record).toBe('function');
    expect((props.record as any).title).toBe('Current popup record');
    expect((props.record as any).hasChildren).toBe(true);
  });
});
