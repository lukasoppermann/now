import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { getNow } from './modules/getNow';

const now = new Date()

const getItemsFromStorage = () => [['Berlin', 'Europe/Berlin'], ['London', 'Europe/London'], ['San Francisco', 'America/Los_Angeles']]

const ITEMS = getItemsFromStorage().map(([location, timezone]) => {
  
  const theirNow = getNow(now, timezone)

  return {
    location: location,
    time: theirNow.time,
    offset: theirNow.offset,
    title: `${location}`,
    subtitle: theirNow.time,
    accessory: `${theirNow.comparedToMe} (${theirNow.offset})`,
  };
});


export default function Command() {

  
  return (
    <List>
      {ITEMS.map((item) => (
        <List.Item
          key={item.location}
          icon={Icon.Clock}
          title={item.title}
          subtitle={item.subtitle}
          accessories={[{ text: item.accessory }]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content={item.time} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
