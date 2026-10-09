import { HelpTopicPage } from '../features/help/components/HelpTopicPage';
import { NotFound } from './NotFound';

export function HelpTopicRoute() {
  return <HelpTopicPage notFound={<NotFound />} />;
}
