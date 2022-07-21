import { generateMockedSearchService } from './search-service';
import { generateMockedQuestionSubmissionService } from './question-submission-service';
import { generateMockedAutocompleteService } from './autocomplete-service';
import {
  AutocompleteService,
  QuestionSubmissionService,
  SearchService,
  UniversalSearchRequest,
  UniversalSearchResponse,
  VerticalSearchRequest,
  VerticalSearchResponse,
  QuestionSubmissionRequest,
  QuestionSubmissionResponse,
  UniversalAutocompleteRequest,
  AutocompleteResponse,
  VerticalAutocompleteRequest,
  FilterSearchRequest,
  FilterSearchResponse
} from '@yext/search-headless-react';

let mockedSearchService = generateMockedSearchService();
let mockedQuestionSubmissionService = generateMockedQuestionSubmissionService();
let mockedAutoCompleteService = generateMockedAutocompleteService();

/**
 * Mock SearchCore class
 */
export class SearchCore {
  searchService: SearchService;
  questionSubmissionService: QuestionSubmissionService;
  autoCompleteService: AutocompleteService;

  constructor() {
    this.searchService = mockedSearchService;
    this.questionSubmissionService = mockedQuestionSubmissionService;
    this.autoCompleteService = mockedAutoCompleteService;
  }

  universalSearch(request: UniversalSearchRequest): Promise<UniversalSearchResponse> {
    return this.searchService.universalSearch(request);
  }

  verticalSearch(request: VerticalSearchRequest): Promise<VerticalSearchResponse> {
    return this.searchService.verticalSearch(request);
  }

  submitQuestion(request: QuestionSubmissionRequest): Promise<QuestionSubmissionResponse> {
    return this.questionSubmissionService.submitQuestion(request);
  }

  universalAutocomplete(request: UniversalAutocompleteRequest): Promise<AutocompleteResponse> {
    return this.autoCompleteService.universalAutocomplete(request);
  }

  verticalAutocomplete(request: VerticalAutocompleteRequest): Promise<AutocompleteResponse> {
    return this.autoCompleteService.verticalAutocomplete(request);
  }

  filterSearch(request: FilterSearchRequest): Promise<FilterSearchResponse> {
    return this.autoCompleteService.filterSearch(request);
  }
}

/**
 * The decorator to be used in .storybook/preview to read story-specific data off
 * the story's parameters to mock SearchCore's services on a per-story basis.
 */
export function SearchCoreDecorator(story, { parameters }) {
  if (parameters?.searchCoreServices) {
    const services = parameters.searchCoreServices;
    if (services.searchService) {
      mockedSearchService = services.searchService;
    }
    if (services.questionSubmissionService) {
      mockedQuestionSubmissionService = services.questionSubmissionService;
    }
    if (services.autoCompleteService) {
      mockedAutoCompleteService = services.autoCompleteService;
    }
  }
  return story();
}