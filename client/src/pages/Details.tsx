import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, ChevronDown } from 'lucide-react';
import { useAllContent } from '@/hooks/useContentQueries';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  const { data: allContent, isLoading } = useAllContent();

  // Find the content item
  const content = React.useMemo(() => {
    // If we have state data from navigation, use it directly
    if (location.state && typeof location.state === 'object') {
      console.log('Using content from location state:', location.state);
      return location.state;
    }

    if (!allContent || !id) return null;

    // Search in all content types
    const allItems = [
      ...(allContent.movies || []),
      ...(allContent.webSeries || []),
      ...(allContent.shows || [])
    ];

    console.log('Searching for content with ID:', id);
    console.log('Available items:', allItems.map(item => ({ id: item.id, content_id: item.content_id, title: item.title })));

    // Try to find by database id first, then content_id
    const foundContent = allItems.find(item => 
      item.id === id || 
      item.content_id === id ||
      (item.movie && item.movie.content_id === id) ||
      (item.web_series && item.web_series.content_id === id) ||
      (item.show && item.show.id === id)
    );

    console.log('Found content:', foundContent);
    return foundContent;
  }, [allContent, id, location.state]);

  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<any[]>([]);

  useEffect(() => {
    if (content?.content_type === 'Web Series' && content.web_series?.seasons) {
      const seasonData = content.web_series.seasons[selectedSeason - 1];
      if (seasonData?.episode_id_list) {
        // Here you would fetch episodes by IDs, for now using mock data
        setCurrentSeasonEpisodes([
          { id: '1', title: `Episode 1`, description: 'Episode description 1' },
          { id: '2', title: `Episode 2`, description: 'Episode description 2' },
          { id: '3', title: `Episode 3`, description: 'Episode description 3' },
        ]);
      }
    } else if (content?.content_type === 'Show' && content.show?.episode_id_list) {
      // For shows, display episodes in reverse order (latest first)
      const episodes = [
        { id: '1', title: `Episode 1`, description: 'Episode description 1' },
        { id: '2', title: `Episode 2`, description: 'Episode description 2' },
        { id: '3', title: `Episode 3`, description: 'Episode description 3' },
      ].reverse();
      setCurrentSeasonEpisodes(episodes);
    }
  }, [content, selectedSeason]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!content) {
    console.log('Content not found for ID:', id);
    console.log('Available content:', allContent);
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-lg mb-4">Content not found</div>
            <div className="text-sm text-gray-400">ID: {id}</div>
            <div className="text-sm text-gray-400 mt-2">
              Available items: {allContent ? (allContent.movies?.length || 0) + (allContent.webSeries?.length || 0) + (allContent.shows?.length || 0) : 0}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayClick = (episodeId?: string) => {
    if (content.content_type === 'Movie') {
      navigate(`/player/${content.content_id}`);
    } else if (episodeId) {
      navigate(`/player/${content.content_id}?episode=${episodeId}`);
    }
  };

  const handleTrailerClick = () => {
    // Handle trailer functionality
    console.log('Play trailer');
  };

  // Get content details based on type
  const getContentDetails = () => {
    if (content.content_type === 'Movie' && content.movie) {
      return {
        description: content.movie.description,
        release_year: content.movie.release_year,
        rating_type: content.movie.rating_type,
        rating: content.movie.rating,
        duration: content.movie.duration,
        directors: content.movie.director || [],
        writers: content.movie.writer || [],
        cast: content.movie.cast_members || [],
        thumbnail_url: content.movie.thumbnail_url,
        trailer_url: content.movie.trailer_url,
        genres: content.genre || []
      };
    } else if (content.content_type === 'Web Series' && content.web_series?.seasons?.[0]) {
      const season = content.web_series.seasons[0];
      return {
        description: season.season_description,
        release_year: season.release_year,
        rating_type: season.rating_type,
        rating: season.rating,
        duration: null, // Web series don't have duration
        directors: season.director || [],
        writers: season.writer || [],
        cast: season.cast_members || [],
        thumbnail_url: season.thumbnail_url,
        trailer_url: season.trailer_url,
        genres: content.genre || []
      };
    } else if (content.content_type === 'Show' && content.show) {
      return {
        description: content.show.description,
        release_year: content.show.release_year,
        rating_type: content.show.rating_type,
        rating: content.show.rating,
        duration: null, // Shows don't have duration
        directors: content.show.directors || [],
        writers: content.show.writers || [],
        cast: content.show.cast_members || [],
        thumbnail_url: content.show.thumbnail_url,
        trailer_url: content.show.trailer_url,
        genres: content.show.genres || content.genre || []
      };
    }
    return {
      description: '',
      release_year: null,
      rating_type: null,
      rating: null,
      duration: null,
      directors: [],
      writers: [],
      cast: [],
      thumbnail_url: '',
      trailer_url: '',
      genres: []
    };
  };

  const details = getContentDetails();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Half - Thumbnail and Buttons */}
          <div className="w-1/2">
            {/* Thumbnail */}
            <div className="relative group mb-4">
              <div 
                className={`relative overflow-hidden rounded-lg ${
                  content.content_type === 'Movie' ? 'cursor-pointer' : 'cursor-default'
                }`}
                onClick={() => content.content_type === 'Movie' && handlePlayClick()}
              >
                <img
                  src={details.thumbnail_url || '/placeholder.svg'}
                  alt={content.title}
                  className="w-full h-[400px] object-cover"
                />
                {content.content_type === 'Movie' && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {content.content_type === 'Movie' && (
                <Button 
                  onClick={() => handlePlayClick()}
                  className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play
                </Button>
              )}
              <Button 
                onClick={handleTrailerClick}
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-black flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Trailer
              </Button>
            </div>

            {/* Content Details for Movies */}
            {content.content_type === 'Movie' && (
              <div className="mt-6 space-y-4">
                <h1 className="text-3xl font-bold">{content.title}</h1>

                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-600 text-black font-semibold">
                    {content.content_type}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>{details.rating_type}</span>
                  <span>★ {details.rating}</span>
                  <span>{details.release_year}</span>
                  {details.duration && <span>{details.duration} min</span>}
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300">{details.description}</p>
                </div>

                {details.genres.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {details.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {details.directors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Directors</h3>
                    <p className="text-gray-300">{details.directors.join(', ')}</p>
                  </div>
                )}

                {details.writers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Writers</h3>
                    <p className="text-gray-300">{details.writers.join(', ')}</p>
                  </div>
                )}

                {details.cast.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Cast</h3>
                    <p className="text-gray-300">{details.cast.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Half - Details for Web Series and Shows OR Full Width for Movies */}
          {content.content_type !== 'Movie' && (
            <div className="w-1/2">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">{content.title}</h1>

                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-600 text-black font-semibold">
                    {content.content_type}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>{details.rating_type}</span>
                  <span>★ {details.rating}</span>
                  <span>{details.release_year}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300">{details.description}</p>
                </div>

                {details.genres.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {details.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {details.directors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Directors</h3>
                    <p className="text-gray-300">{details.directors.join(', ')}</p>
                  </div>
                )}

                {details.writers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Writers</h3>
                    <p className="text-gray-300">{details.writers.join(', ')}</p>
                  </div>
                )}

                {details.cast.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Cast</h3>
                    <p className="text-gray-300">{details.cast.join(', ')}</p>
                  </div>
                )}

                {/* Season Dropdown for Web Series */}
                {content.content_type === 'Web Series' && content.web_series?.seasons && (
                  <div className="mt-6">
                    <div className="relative">
                      <button
                        onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                        className="flex items-center justify-between w-full p-3 bg-gray-800 rounded-lg text-left"
                      >
                        <span>Season {selectedSeason}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSeasonDropdownOpen && (
                        <div className="absolute top-full left-0 w-full bg-gray-800 rounded-lg mt-1 z-10 border border-gray-700">
                          {content.web_series.seasons.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedSeason(index + 1);
                                setIsSeasonDropdownOpen(false);
                              }}
                              className="w-full p-3 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                            >
                              Season {index + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Episodes List */}
                {currentSeasonEpisodes.length > 0 && (
                  <div className="mt-6 max-h-96 overflow-y-auto">
                    <h3 className="font-semibold mb-4">Episodes</h3>
                    <div className="space-y-2">
                      {currentSeasonEpisodes.map((episode, index) => (
                        <div
                          key={episode.id}
                          onClick={() => handlePlayClick(episode.id)}
                          className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{episode.title}</h4>
                              <p className="text-sm text-gray-400">{episode.description}</p>
                            </div>
                            <Play className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Full Width Ads Section */}
        <div className="mt-12">
          <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 text-lg">Advertisement Space</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;