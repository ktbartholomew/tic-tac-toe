from sys import argv
from rethinkdb import r
import os
import json
import numpy
import sklearn

WIN_WEIGHT = 2.1
LOSE_WEIGHT = 1
DRAW_WEIGHT = 1

# Which state are we evaluating?
try:
    state = argv[1]
except IndexError:
    state = '000000000'

# Based on the state, we can figure out which team we're on.
if state.count("0") % 2 != 0:
    my_team = "1"
else:
    my_team = "2"

# Where is the database?
if os.getenv("DB_HOST") != None:
    db_host = os.getenv("DB_HOST")
else:
    db_host = "localhost"

# Grab all of our prior data about this state
conn = r.connect(db_host)
frames = list(r.db('tictactoe').table('bot_stats').get_all(state, index='state').run(conn))

all_action_count = len(frames)
all_actions = []

'''
Let's first make sure that our list of actions at least contains every possible
action. This will allow us to assign scores to actions we haven't gathered data
for yet.
'''
state_array = list(state)
for idx, char in enumerate(state_array):
    action = list("000000000")
    if state_array[idx] == "0":
        action[idx] = my_team
        all_actions.append("".join(action))

for frame in frames:
    all_actions.append(frame["action"])

all_actions = numpy.unique(all_actions)

for action in all_actions:
    win = 0
    lose = 0
    draw = 0

    for frame in frames:
        if frame["action"] == action:
            if frame["result"] == my_team:
                win += 1
            elif frame["result"] == "0":
                draw += 1
            else:
                lose += 1

    if all_action_count != 0:
        score = (win / all_action_count * WIN_WEIGHT)
        score = score + (draw / all_action_count * DRAW_WEIGHT)
        score = score - (lose / all_action_count * LOSE_WEIGHT)
    else:
        score = 0

    print(action + " score: " + str(score))
