import events from "./input.json";
import _ from "lodash";

const sportingEvents = events?.data?.sporting_events;
const slateEvents = events?.data?.slate_events;

const sportingEventsList = Object.keys(sportingEvents).map(
  (id) => sportingEvents[id]
);

function combineEvents(sportingEvents, slateEvents) {
  let storedEventsList = [];

  const combinedEventsList = _.sortBy(
    [...sportingEvents, ...slateEvents],
    (eventObj) => {
      const date = eventObj.date;
      let time = eventObj.time;
      // Sorting works correctly by stripping off the 'ET'
      if (time.includes("ET")) {
        time = time.substring(0, time.length - 2);
      }
      return new Date(`${date} ${time}`);
    }
  );

  return combinedEventsList.reduce((acc, currentEvent) => {
    const currentEventGameId = currentEvent.iGameCodeGlobalId;

    // Skip events that we have already added in groups
    if (
      storedEventsList.find(
        (storedEvent) => storedEvent.iGameCodeGlobalId === currentEventGameId
      )
    ) {
      return acc;
    }

    // Group events that have the same teams and date/time in the list
    const groupedEventsList = combinedEventsList.filter((combinedEvent) => {
      return (
        currentEvent.teams === combinedEvent?.teams &&
        currentEvent.date === combinedEvent?.date &&
        currentEvent.time === combinedEvent?.time
      );
    });

    storedEventsList = [...storedEventsList, ...groupedEventsList];

    let event = {};
    if (groupedEventsList.length > 1) {
      event = groupedEventsList;
    } else {
      event = {
        ...currentEvent
      };
    }

    return acc.concat({
      event,
      isSlate: !!event.idSlate
    });
  }, []);
}

console.log(combineEvents(sportingEventsList, slateEvents));
