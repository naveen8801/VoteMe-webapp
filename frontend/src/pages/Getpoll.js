import React, { useState, useEffect } from 'react';
import { CastVote, GetPoll } from '../api';
import Barchart from '../components/Barchart/Barchart';

import CircularProgress from '@material-ui/core/CircularProgress';

import Pusher from 'pusher-js';

function Getpoll(props) {
  const pollID = props.props.match.params.poll;

  const [poll, setpoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [AlltotalVotes, setAllTotalvotes] = useState(0);
  const [maindata, setmaindata] = useState(null);
  const [loading, setloading] = useState(false);

  const newFetch = () => {
    setloading(true);
    GetPoll(pollID)
      .then((res) => {
        const newdata = res.data;
        setpoll(newdata);
        setmaindata(newdata);
      })
      .catch((error) => {
        console.log(error);
      });
    setloading(false);
  };

  const pusherData = () => {
    Pusher.logToConsole = true;

    var pusher = new Pusher('1fe7a99eeddf4f3b49d5', {
      cluster: 'ap2',
    });

    var channel = pusher.subscribe('polling');
    channel.bind('poll_created', function (data) {
      const temp = data;
      console.log('yes');
      setmaindata(temp);
      console.log(temp);
      if (data) {
        let totalVotes = 0;
        temp.choices.forEach((choice) => {
          totalVotes += choice.count;
        });
        setAllTotalvotes(totalVotes);
        console.log(AlltotalVotes);
      } else {
        setAllTotalvotes(0);
      }
    });
  };

  useEffect(() => {
    newFetch();
    pusherData();
  }, []);

  const getChoicePercentage = (selectedChoice) => {
    if (AlltotalVotes === 0) {
      return 0;
    }
    return Math.round((selectedChoice.count / AlltotalVotes) * 100);
  };

  const vote = async (choice) => {
    const currentchoiceList = maindata.choices;
    const choice_be_updated = currentchoiceList.find((x) => x._id === choice);
    choice_be_updated.count += 1;
    const updated_poll = {
      ...maindata,
      choice_be_updated,
    };

    setpoll(updated_poll);
    console.log('no');
    console.log(poll);
    const poll_updated = await CastVote(pollID, choice, updated_poll);
    setVoted(true);

  };

  return (
    <div className="container mx-auto mt-16 px-5">
      {!maindata ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4rem',
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto bg-white shadow">
          <header className="px-5 py-4 flex justify-between items-center">
            <strong>{poll.title}</strong>
            {voted ? (
              <strong>
                <span>{AlltotalVotes} votes Voted !</span>
              </strong>
            ) : null}
          </header>

          {maindata.choices.map((choice) => {
            return (
              <div
                className="px-5 py-4 border-t border-gray-400 flex justify-between items-center"
                key={choice._id}
              >
                {choice.name}

                {voted ? (
                  <span className="text-blue-500">
                    {getChoicePercentage(choice)}%
                  </span>
                ) : (
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => vote(choice._id)}
                  >
                    Vote
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '4rem',
        }}
      >
        {loading ? <CircularProgress /> : <Barchart id={pollID} />}
      </div>
    </div>
  );
}

export default Getpoll;
