import g4f
import sys
import time
import random

# Verse passed through args
verses = sys.argv[1]

themes = ["nature", "trees", "forest", "thunder", 'mountains', "rain", "sunrise", "waves", "cliff"]

prompt = f"""
Please analyze the context of the provided verse from the Holy Quran. Imagine this verse being played in a video, and your task is to select a single word that best represents the prevailing emotion or theme from the following list: {', '.join(themes)}. 

The verse: {verses}

YOUR RESPONSE SHOULD BE THAT ONE WORD ONLY, WITHOUT ANY ADDITIONAL DESCRIPTION OR EXPLANATION.
"""

response = ''
# set to timeout loop after 30 seconds
timeout = time.time() + 30

while response.lower() not in themes:
  if (time.time() > timeout):
    print("Breaking loop and choosing theme randomly due to timeout");
    response = themes[random.randint(0, len(themes) - 1)];
    break;
  try:
      response = g4f.ChatCompletion.create(
          model="gpt-3.5-turbo",
          messages=[{"role": "user", "content": prompt}],
          stream=False,
          timeout=20
      )
      print(response)
  except:
      pass

print("Topic: " + response)