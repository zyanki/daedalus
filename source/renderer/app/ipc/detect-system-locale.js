// @flow
import { RendererIpcChannel } from './lib/RendererIpcChannel';
import { DETECT_SYSTEM_LOCALE_CHANNEL } from '../../../common/ipc/api';
import type { DetectSystemLocaleResponse } from '../../../common/ipc/api';

export const detectSystemLocaleChannel: RendererIpcChannel<
  DetectSystemLocaleResponse,
  void
> = new RendererIpcChannel(DETECT_SYSTEM_LOCALE_CHANNEL);
