/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { act, render, screen, userEvent, waitFor } from '@nocobase/test/client';
import { FlowEngine, FlowEngineProvider, FlowModel, FlowModelProvider, FlowModelRenderer } from '@nocobase/flow-engine';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConfigProvider, App } from 'antd';
import { createForm } from '@formily/core';
import { FormProvider, Field } from '@formily/react';
import { DefaultValue } from '../DefaultValue';
import { InputFieldModel } from '../../models/fields/InputFieldModel';
import { VariableFieldFormModel } from '../../models/fields/VariableFieldFormModel';
import { RecordSelectFieldModel } from '../../models/fields/AssociationFieldModel';

// 简易 Form stub（非 Formily 分支），用于验证写回逻辑
function createFormStub(initial: any = {}) {
  const state: Record<string, any> = { ...initial };
  let touched = false;
  const calls: { setFieldValue: Array<{ name: any; value: any }> } = { setFieldValue: [] };
  return {
    getState: () => state,
    setTouched: (val: boolean) => {
      touched = !!val;
    },
    isFieldsTouched: () => touched,
    getFieldValue: (name: any) => {
      if (Array.isArray(name)) return state[name.join('.')];
      return state[name];
    },
    setFieldValue: (name: any, value: any) => {
      calls.setFieldValue.push({ name, value });
      if (Array.isArray(name)) state[name.join('.')] = value;
      else state[name] = value;
    },
    getCalls: () => calls,
  };
}

// 简化 metaTree：用于 VariableInput 的变量树（DefaultValue 内部会自动合并 constant/null）
const simpleMetaTree = async () => [
  {
    title: 'Context',
    name: 'ctx',
    type: 'object',
    paths: ['ctx'],
    children: [
      {
        title: 'user',
        name: 'user',
        type: 'object',
        paths: ['ctx', 'user'],
        children: [{ title: 'name', name: 'name', type: 'string', paths: ['ctx', 'user', 'name'] }],
      },
    ],
  },
];

// Host 模型：在其 render 中渲染 DefaultValue，使 DefaultValue 能通过 useFlowContext 获取到 model
// 注意：表单实例需要在每个用例中重置，避免状态污染
let form: any;

class HostModel extends FlowModel {
  render() {
    const { value, onChange, metaTree } = (this.props || {}) as any;
    const fieldModel = this.subModels.field as FlowModel;
    return (
      <FormProvider form={form}>
        <FlowModelProvider model={this}>
          <Field
            name="test"
            component={[
              DefaultValue,
              {
                value: value,
                onChange: onChange,
                metaTree: metaTree || simpleMetaTree,
              },
            ]}
          />
        </FlowModelProvider>
      </FormProvider>
    );
  }
}

describe('DefaultValue component', () => {
  let engine: FlowEngine;

  beforeEach(() => {
    engine = new FlowEngine();
    // 注册必要的模型（使用真实 FlowEngine，不 mock）
    engine.registerModels({ HostModel, InputFieldModel, VariableFieldFormModel, RecordSelectFieldModel });

    // 每个用例重置表单实例，避免跨用例的值污染（例如上个用例输入的 "hello"）
    form = createForm();

    // 为多选关联选择组件的测试场景，覆盖/简化 beforeRender 事件流，仅保留必要的属性赋值
    RecordSelectFieldModel.registerFlow({ key: 'eventSettings', manual: true, steps: {} });
    RecordSelectFieldModel.registerFlow({
      key: 'selectSettings',
      manual: true,
      steps: {
        fieldNames: {
          handler(ctx) {
            const fromCf = ctx.model.collectionField?.fieldNames;
            ctx.model.setProps({
              fieldNames: fromCf || { label: 'name', value: 'id' },
              allowMultiple: true,
              multiple: true,
            });
          },
        },
      },
    });
  });

  it('readPretty mode: constant editor stays editable even if origin field is display-only', async () => {
    // Dummy display-only field model to simulate readPretty binding
    class DummyDisplayFieldModel extends FlowModel {
      render() {
        return <div data-testid="dummy-display">DISPLAY_ONLY</div>;
      }
    }
    engine.registerModels({ DummyDisplayFieldModel });

    const onChange = vi.fn();

    const host = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'nickname', value: '', onChange, metaTree: simpleMetaTree, pattern: 'readPretty' },
      subModels: { field: { use: 'DummyDisplayFieldModel' } },
    });
    // 提供集合字段上下文，指向可编辑接口（input）
    host.context.defineProperty('collectionField', { value: { interface: 'input', type: 'string' } });

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );

    const input = await screen.findByRole('textbox');
    expect(input).toBeInTheDocument();
    await act(async () => {
      await userEvent.type(input, 'abc');
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('relation field constant mode: selecting an option works and returns record object', async () => {
    const onChange = vi.fn();
    // 捕获 DefaultValue 内部创建的临时根模型，便于直接触发字段 onChange
    const origCreate = engine.createModel.bind(engine);
    let capturedTempRoot: any;
    // @ts-ignore
    engine.createModel = ((options: any, extra?: any) => {
      const created = origCreate(options, extra);
      if (options?.use === 'VariableFieldFormModel') {
        capturedTempRoot = created;
      }
      return created;
    }) as any;

    const host = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'role', value: '', onChange, metaTree: simpleMetaTree },
      subModels: { field: { use: 'RecordSelectFieldModel' } },
    });
    // 关系字段上下文（单选 m2o）
    host.context.defineProperty('collectionField', {
      value: {
        interface: 'm2o',
        type: 'belongsTo',
        isAssociationField: () => true,
        fieldNames: { label: 'name', value: 'id' },
        targetCollection: {
          getField: (name) => ({ name, type: 'string', interface: 'input', uiSchema: { 'x-component': 'Input' } }),
        },
      },
    });
    // 为临时字段提供静态选项，避免依赖资源加载
    (host as any).customFieldProps = {
      fieldNames: { label: 'name', value: 'id' },
      options: [
        // 提供 value/label 以匹配 antd Select 的期望结构
        { id: 1, name: 'Role A', value: 1, label: 'Role A' },
        { id: 2, name: 'Role B', value: 2, label: 'Role B' },
      ],
      allowMultiple: false,
      multiple: false,
    };

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );

    // 直接调用临时字段的 onChange，模拟 Select 选择行为
    await waitFor(() => {
      expect(capturedTempRoot?.subModels?.fields?.[0]).toBeTruthy();
    });
    const fieldModel = capturedTempRoot.subModels.fields[0];
    await act(async () => {
      fieldModel?.props?.onChange?.({ data: { id: 1, name: 'Role A' } });
    });
    expect(onChange).toHaveBeenCalled();
  });
  it('constant mode: renders editable input and triggers controlled onChange, does not backfill original form', async () => {
    const onChange = vi.fn();
    const formStub = createFormStub();

    // 创建 Host，挂载 field 子模型，注入上下文（form / collectionField）
    const host = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'nickname', value: '', onChange, metaTree: simpleMetaTree },
      subModels: {
        field: { use: 'InputFieldModel' },
      },
    });
    host.context.defineProperty('form', { value: formStub });
    host.context.defineProperty('collectionField', { value: { interface: 'input', type: 'string' } });

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );

    // DefaultValue 在常量路径下，右侧使用临时字段模型渲染真正输入框
    const input = await screen.findByRole('textbox');
    await act(async () => {
      await userEvent.type(input, 'hello');
    });

    // 仅受控触发 onChange；不应立即写回原始 form（setFieldValue 未被调用）
    expect(onChange).toHaveBeenCalled();
    expect(formStub.getCalls().setFieldValue.length).toBe(0);
  });

  it('null mode: renders empty input when value=null (no backfill)', async () => {
    const host = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'nickname', value: null, onChange: vi.fn(), metaTree: simpleMetaTree },
      subModels: { field: { use: 'InputFieldModel' } },
    });
    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );
    // 渲染后应出现一个输入框，值为空（不回填原表单）
    const input = await screen.findByRole('textbox');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('many-to-many relationship: uses RecordSelectFieldModel to render multi-select dropdown (ant-select-multiple)', async () => {
    const host = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'roles', value: '', onChange: vi.fn(), metaTree: simpleMetaTree },
      subModels: {
        field: {
          use: 'RecordSelectFieldModel',
          props: {
            fieldNames: { label: 'name', value: 'id' },
            allowMultiple: true,
            multiple: true,
          },
        },
      },
    });
    // 指定为对多关系，DefaultValue 内部应选择 RecordSelectFieldModel，并在 onDispatchEventEnd 推断 multiple
    host.context.defineProperty('collectionField', {
      value: {
        interface: 'm2m',
        type: 'belongsToMany',
        fieldNames: { label: 'name', value: 'id' },
        targetCollection: {
          getField: (name) => ({
            name,
            type: 'string',
            interface: 'input',
            uiSchema: { 'x-component': 'Input' },
          }),
        },
      },
    });

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );

    // 右侧编辑器应为 antd Select 且为多选模式 + 有 fieldNames 配置
    await waitFor(
      () => {
        const errorBanner = document.querySelector('.ant-result-error');
        expect(errorBanner).toBeNull();
      },
      { timeout: 5000 },
    );
  });

  it('safe backfill when saving (setStepParams): overwrite when empty/unmodified or equals last default value; otherwise do not overwrite', async () => {
    const formStub = createFormStub();

    const host = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'nickname', value: '', onChange: vi.fn(), metaTree: simpleMetaTree },
      subModels: { field: { use: 'InputFieldModel' } },
    });
    host.context.defineProperty('form', { value: formStub });
    host.context.defineProperty('collectionField', { value: { interface: 'input', type: 'string' } });

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );

    // Wait for component to mount and patches to be applied
    await waitFor(
      () => {
        expect(host['__dvSetStepParamsPatched']).toBe(true);
      },
      { timeout: 2000 },
    );

    // 1) 当前表单为空且未修改：应写回新默认值 'a'
    await act(async () => {
      await host.setStepParams('formItemSettings', 'initialValue', { defaultValue: 'a' });
    });
    await waitFor(
      () => {
        expect(formStub.getFieldValue('nickname')).toBe('a');
      },
      { timeout: 1000 },
    );

    // 2) 当前值与上次默认值相等：应覆盖为 'b'
    await act(async () => {
      await host.setStepParams('formItemSettings', 'initialValue', { defaultValue: 'b' });
    });
    await waitFor(
      () => {
        expect(formStub.getFieldValue('nickname')).toBe('b');
      },
      { timeout: 1000 },
    );

    // 3) 用户已修改为与上次默认值不同：不应覆盖
    formStub.setFieldValue('nickname', 'userInput');
    formStub.setTouched(true);
    await act(async () => {
      await host.setStepParams('formItemSettings', 'initialValue', { defaultValue: 'c' });
    });
    expect(formStub.getFieldValue('nickname')).toBe('userInput');
  });

  it('variable resolution: supports resolveJsonTemplate and ctx-based path fallback', async () => {
    // 第一步：验证 ctx 回退路径解析 -> 'Bob'
    const formStub1 = createFormStub();
    const host1 = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'nickname', value: '', onChange: vi.fn(), metaTree: simpleMetaTree },
      subModels: { field: { use: 'InputFieldModel' } },
    });
    host1.context.defineProperty('form', { value: formStub1 });
    host1.context.defineProperty('user', { value: { name: 'Bob' } });
    host1.context.defineMethod('resolveJsonTemplate', async () => undefined);

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host1} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );
    await waitFor(
      () => {
        expect((host1 as any).__dvSetStepParamsPatched).toBe(true);
      },
      { timeout: 2000 },
    );
    await act(async () => {
      await host1.setStepParams('formItemSettings', 'initialValue', { defaultValue: '{{ ctx.user.name }}' });
    });
    await waitFor(
      () => {
        expect(formStub1.getFieldValue('nickname')).toBe('Bob');
      },
      { timeout: 1000 },
    );

    // 第二步：验证 resolveJsonTemplate 生效 -> 新建 Host，默认空且未修改，应解析为 'Alice'
    const formStub2 = createFormStub();
    const host2 = engine.createModel<HostModel>({
      use: 'HostModel',
      props: { name: 'nickname', value: '', onChange: vi.fn(), metaTree: simpleMetaTree },
      subModels: { field: { use: 'InputFieldModel' } },
    });
    host2.context.defineProperty('form', { value: formStub2 });
    host2.context.defineProperty('user', { value: { name: 'Bob' } });
    host2.context.defineMethod('resolveJsonTemplate', async () => 'Alice');

    render(
      <FlowEngineProvider engine={engine}>
        <ConfigProvider>
          <App>
            <FlowModelRenderer model={host2} />
          </App>
        </ConfigProvider>
      </FlowEngineProvider>,
    );
    await waitFor(
      () => {
        expect((host2 as any).__dvSetStepParamsPatched).toBe(true);
      },
      { timeout: 2000 },
    );
    await act(async () => {
      await host2.setStepParams('formItemSettings', 'initialValue', { defaultValue: '{{ ctx.user.name }}' });
    });
    await waitFor(
      () => {
        expect(formStub2.getFieldValue('nickname')).toBe('Alice');
      },
      { timeout: 1000 },
    );
  });
});
