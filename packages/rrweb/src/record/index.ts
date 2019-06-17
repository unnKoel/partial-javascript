import { snapshot } from "@partial/rrweb-snapshot";
import initObservers from "./observer";
import { mirror, on, getWindowWidth, getWindowHeight } from "../utils";
import {
  EventType,
  event,
  eventWithTime,
  recordOptions,
  IncrementalSource,
  listenerHandler
} from "../types";

function wrapEvent(e: event): eventWithTime {
  return {
    ...e,
    timestamp: Date.now()
  };
}

function record(options: recordOptions = {}): listenerHandler | undefined | void {
  const {
    emit,
    checkoutEveryNms, //checkout every N millisecond.
    checkoutEveryNth, //checkout every N times.
    blockClass = "rr-block", //  An element with the class name .rr-block will not be recorded.
    ignoreClass = "rr-ignore", // don't record it's input event.
    inlineStylesheet = true
  } = options;
  // runtime checks for user options
  if (!emit) {
    throw new Error("emit function is required");
  }

  let lastFullSnapshotEvent: eventWithTime;
  let incrementalSnapshotCount = 0; //incremental snapshot count
  const wrappedEmit = (e: eventWithTime, isCheckout?: boolean) => {
    emit(e, isCheckout);
    if (e.type === EventType.FullSnapshot) {
      lastFullSnapshotEvent = e;
      incrementalSnapshotCount = 0;
    } else if (e.type === EventType.IncrementalSnapshot) {
      incrementalSnapshotCount++;
      const exceedCount =
        checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime =
        checkoutEveryNms &&
        e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
      if (exceedCount || exceedTime) {
        takeFullSnapshot(true);
      }
    }
  };

  /**
   * take full snapshot
   * @param isCheckout
   */
  function takeFullSnapshot(isCheckout = false) {
    wrappedEmit(
      wrapEvent({
        type: EventType.Meta,
        data: {
          href: window.location.href,
          width: getWindowWidth(),
          height: getWindowHeight()
        }
      }),
      isCheckout
    );
    const [node, idNodeMap] = snapshot(document, blockClass, inlineStylesheet);
    if (!node) {
      return console.warn("Failed to snapshot the document");
    }
    mirror.map = idNodeMap;
    wrappedEmit(
      wrapEvent({
        type: EventType.FullSnapshot,
        data: {
          node,
          initialOffset: {
            left: document.documentElement!.scrollLeft,
            top: document.documentElement!.scrollTop
          }
        }
      })
    );
  }

  try {
    const handlers: listenerHandler[] = [];
    handlers.push(
      on("DOMContentLoaded", () => {
        wrappedEmit(
          wrapEvent({
            type: EventType.DomContentLoaded,
            data: {}
          })
        );
      })
    );
    const init = () => {
      takeFullSnapshot();

      handlers.push(
        initObservers({
          mutationCb: m =>
            wrappedEmit(
              wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.Mutation,
                  ...m
                }
              })
            ),
          mousemoveCb: positions =>
            wrappedEmit(
              wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.MouseMove,
                  positions
                }
              })
            ),
          mouseInteractionCb: d =>
            wrappedEmit(
              wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.MouseInteraction,
                  ...d
                }
              })
            ),
          scrollCb: p =>
            wrappedEmit(
              wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.Scroll,
                  ...p
                }
              })
            ),
          viewportResizeCb: d =>
            wrappedEmit(
              wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.ViewportResize,
                  ...d
                }
              })
            ),
          inputCb: v =>
            wrappedEmit(
              wrapEvent({
                type: EventType.IncrementalSnapshot,
                data: {
                  source: IncrementalSource.Input,
                  ...v
                }
              })
            ),
          blockClass,
          ignoreClass,
          inlineStylesheet
        })
      );
    };
    if (
      document.readyState === "interactive" ||
      document.readyState === "complete"
    ) {
      init();
    } else {
      handlers.push(
        on(
          "load",
          () => {
            wrappedEmit(
              wrapEvent({
                type: EventType.Load,
                data: {}
              })
            );
            init();
          },
          window
        )
      );
    }
    return () => {
      handlers.forEach(h => h());
    };
  } catch (error) {
    // TODO: handle internal error
    console.warn(error);
  }
}

export default record;
