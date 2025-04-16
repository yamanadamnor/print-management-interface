const SEPARATOR = "/";
const SINGLE = "+";
const ALL = "#";

export function matches(pattern: string, topic: string) {
  const patternSegments = pattern.split(SEPARATOR);
  const topicSegments = topic.split(SEPARATOR);

  const patternLength = patternSegments.length;
  const topicLength = topicSegments.length;
  const lastIndex = patternLength - 1;

  for (let i = 0; i < patternLength; i++) {
    const currentPattern = patternSegments[i];
    const patternChar = currentPattern[0];
    const currentTopic = topicSegments[i];

    if (!currentTopic && !currentPattern) continue;

    if (!currentTopic && currentPattern !== ALL) return false;

    // Only allow # at end
    if (patternChar === ALL) return i === lastIndex;
    if (patternChar !== SINGLE && currentPattern !== currentTopic) return false;
  }

  return patternLength === topicLength;
}
