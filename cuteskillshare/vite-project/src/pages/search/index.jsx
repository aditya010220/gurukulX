import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Icon from '../../components/AppIcon';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const shouldSearch = query.length > 1;

  const searchResults = useQuery(
    api.users.search,
    shouldSearch ? { searchQuery: query } : 'skip'
  );

  const isSearching = shouldSearch && searchResults === undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Search Results{query ? ` for "${query}"` : ''}
      </h1>

      {!query ? (
        <div className="text-center py-16">
          <Icon name="Search" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-6" />
          <p className="text-2xl font-semibold text-muted-foreground">Type something to search</p>
        </div>
      ) : !shouldSearch ? (
        <div className="text-center py-16">
          <Icon name="Search" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-6" />
          <p className="text-2xl font-semibold text-muted-foreground">Please enter at least 2 characters</p>
        </div>
      ) : isSearching ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin">
            <Icon name="Loader2" size={48} color="var(--color-primary)" />
          </div>
          <p className="mt-6 text-lg text-muted-foreground">Searching...</p>
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="grid gap-6">
          {searchResults.map((result) => (
            <div key={result._id} className="bg-card p-6 rounded-2xl shadow-warm flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={32} color="var(--color-primary-foreground)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xl text-foreground truncate">{result.name}</p>
                <p className="text-md text-muted-foreground truncate">{result.title || 'No title'}</p>
                {result.skills && result.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {result.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-secondary-foreground">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Icon name="SearchX" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-6" />
          <p className="text-2xl font-semibold text-muted-foreground">No results found for "{query}"</p>
          <p className="text-md text-muted-foreground mt-2">Try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
