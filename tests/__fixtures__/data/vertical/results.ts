import { Result, Source } from '@yext/search-headless-react';

const ctas = {
  c_primaryCTA: {
    link: 'link1',
    label: 'job1',
    linkType: 'link'
  },
  c_secondaryCTA: {
    link: 'link2',
    label: 'job2',
    linkType: 'link'
  }
};

export const mockedVerticalResults: Result[] = [
  {
    rawData: {
      name: 'title1',
      description: 'text1',
      ...ctas
    },
    source: Source.KnowledgeManager,
    id: 'id1'
  },
  {
    rawData: {
      name: 'title2',
      description: 'text2',
      ...ctas
    },
    source: Source.KnowledgeManager,
    id: 'id2'
  },
  {
    rawData: {
      name: 'title3',
      description: 'text3',
      ...ctas
    },
    source: Source.KnowledgeManager,
    id: 'id3'
  }
];