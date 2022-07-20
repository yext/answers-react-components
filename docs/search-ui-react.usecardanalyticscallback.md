<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/search-ui-react](./search-ui-react.md) &gt; [useCardAnalyticsCallback](./search-ui-react.usecardanalyticscallback.md)

## useCardAnalyticsCallback() function

Creates a memoized function for reporting card analytics.

<b>Signature:</b>

```typescript
export declare function useCardAnalyticsCallback(result: Result | DirectAnswerData, analyticsType: CardAnalyticsType): () => void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  result | Result \| DirectAnswerData | result that contains data use in the card analytics event. |
|  analyticsType | [CardAnalyticsType](./search-ui-react.cardanalyticstype.md) | the card analytics event type to report. |

<b>Returns:</b>

() =&gt; void
