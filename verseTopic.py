import g4f

aya = "و لهم عذاب جهنم و بئس المصير"

prompt = f"""
For the follwing verse from the holy quran, analize the context of the verse. The verse would be played in a video and a suitable background video should be chosen. Based on the context of the verse must return only one topic of the following: nature, trees, forest, rain, thunder, mountains, undersee.

ex: وَذَا النُّونِ إِذ ذَّهَبَ مُغَاضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ 
this verse talks about the story of God's Rasul, Younis, in the whale, therefore a suitable topic for the verse can be undersee whale

the verse: {aya}
ONLY RETURN SINGLE WORD REPRESENTING THE TOPIC NAME FROM THE ABOVE MENTIONED TOPICS ONLY AND NOTHING ELSE. DON'T RETURN ANY DESCRIPTION
"""

emotions = ["nature", "trees", "forest", "rain", "thunder", 'mountains', "undersee"]
response = ''
while response.lower() not in emotions:
  try:
      response = g4f.ChatCompletion.create(
          model="gpt-3.5-turbo",
          messages=[{"role": "user", "content": prompt}],
          stream=False,
      )
      print(response)
  except:
      pass