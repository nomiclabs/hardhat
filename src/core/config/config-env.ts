import { ActionType, EnvironmentExtender, TaskArguments } from "../../types";
import * as argumentTypes from "../params/argumentTypes";
import { ConfigurableTaskDefinition } from "../tasks/task-definitions";

import dsl from "./tasks-dsl-instance";

export function task<ArgsT extends TaskArguments>(
  name: string,
  description?: string,
  action?: ActionType<ArgsT>
): ConfigurableTaskDefinition;
export function task<ArgsT extends TaskArguments>(
  name: string,
  action: ActionType<ArgsT>
): ConfigurableTaskDefinition;
export function task<ArgsT extends TaskArguments>(
  name: string,
  descriptionOrAction?: string | ActionType<ArgsT>,
  action?: ActionType<ArgsT>
): ConfigurableTaskDefinition {
  if (descriptionOrAction === undefined) {
    return dsl.task(name);
  }

  if (typeof descriptionOrAction !== "string") {
    return dsl.task(name, descriptionOrAction);
  }

  return dsl.task(name, descriptionOrAction, action);
}

export function internalTask<ArgsT extends TaskArguments>(
  name: string,
  description?: string,
  action?: ActionType<ArgsT>
): ConfigurableTaskDefinition;
export function internalTask<ArgsT extends TaskArguments>(
  name: string,
  action: ActionType<ArgsT>
): ConfigurableTaskDefinition;
export function internalTask<ArgsT extends TaskArguments>(
  name: string,
  descriptionOrAction?: string | ActionType<ArgsT>,
  action?: ActionType<ArgsT>
): ConfigurableTaskDefinition {
  if (descriptionOrAction === undefined) {
    return dsl.internalTask(name);
  }

  if (typeof descriptionOrAction !== "string") {
    return dsl.internalTask(name, descriptionOrAction);
  }

  return dsl.internalTask(name, descriptionOrAction, action);
}

export const types = argumentTypes;

export function usePlugin(name: string): void {
  require(process.cwd() + "/" + name);
}

export const extenders: EnvironmentExtender[] = [];

export function extendEnvironment(extender: EnvironmentExtender) {
  extenders.push(extender);
}
