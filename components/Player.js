import React, { useCallback, useEffect } from "react";
import useSpotify from "../hooks/useSpotify";
import { useSession } from "next-auth/react";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import { useRecoilState } from "recoil";
import useSonginfo from "../hooks/useSonginfo";
import {
  ArrowsRightLeftIcon,
  BackwardIcon,
  ForwardIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ArrowUturnLeftIcon,
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";
import { debounce } from "lodash";

function Player() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = React.useState(50);

  const songInfo = useSonginfo();

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((res) => {
        setCurrentTrackId(res.body?.item?.id);

        spotifyApi.getMyCurrentPlaybackState().then((res) => {
          setIsPlaying(res.body?.is_playing);
        });
      });
    }
  };

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((res) => {
      if (res.body.is_playing) {
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSong();
      setVolume(50);
    }
  }, [currentTrackId, spotifyApi, session]);

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      deboucedAdjustVolume(volume);
    }
  }, [volume]);

  const deboucedAdjustVolume = useCallback(
    debounce(
      (volume) => {
        spotifyApi.setVolume(volume).catch((err) => {});
      },
      [500]
    )
  );

  return (
    <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline h-10 w-10"
          src={songInfo?.album.images?.[0].url}
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-evenly">
        <ArrowsRightLeftIcon className="button" />
        <BackwardIcon className="button" />
        {isPlaying ? (
          <PauseCircleIcon
            onClick={handlePlayPause}
            className="button w-10 h-10"
          />
        ) : (
          <PlayCircleIcon
            onClick={handlePlayPause}
            className="button w-10 h-10"
          />
        )}
        <ForwardIcon className="button" />
        <ArrowUturnLeftIcon className="button" />
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 justify-end">
        <SpeakerXMarkIcon
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className="button"
        />
        <input
          className="w-14 md:w-28"
          value={volume}
          type="range"
          onChange={(e) => setVolume(Number(e.target.value))}
          min={0}
          max={100}
        />
        <SpeakerWaveIcon
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className="button"
        />
      </div>
    </div>
  );
}

export default Player;
