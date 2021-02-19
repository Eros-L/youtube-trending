# -*- coding: UTF-8 -*-

import json
import pandas as pd

pd.set_option('display.max_columns', 500)

# list of different countries
countries = {'US': 'USA', 'GB': 'Great Britain', 'DE': 'Germany', 'CA': 'Canada', 'FR': 'France',
             'RU': 'Russia', 'MX': 'Mexico', 'KR': 'South Korea', 'JP': 'Japan', 'IN': 'India'}
# output
output = []


if __name__ == '__main__':
    # process each country
    for initial, name in countries.items():
        # read data
        video = pd.read_csv('../out/youtube-new/%svideos.csv' % initial, encoding='ISO-8859-1')
        category = json.load(open('../out/youtube-new/%s_category_id.json' % initial, 'r'))

        # drop day
        video['trending_date'] = video['trending_date'].apply(lambda s: s[:3] + s[6:])

        # group data by category
        group_by_cid = video.groupby('category_id')
        output.append({
            'country': name,
            'genres': []
        })

        # process each category
        for cid, group_cid in group_by_cid:
            # name of the category
            cname = None
            for item in category['items']:
                if item and cid == int(item['id']):
                    cname = item['snippet']['title']

            output[-1]['genres'].append({
                'genre': cname,
                'dates': []
            })

            # process each date
            group_by_date = group_cid.groupby('trending_date')
            for date, group_date in group_by_date:
                output[-1]['genres'][-1]['dates'].append({
                    'date': date,
                    'video_count': str(len(group_date)),
                    'views': str(group_date['views'].sum()),
                    'likes': str(group_date['likes'].sum()),
                    'dislikes': str(group_date['dislikes'].sum()),
                    'comment_count': str(group_date['comment_count'].sum())
                })

    # dump
    json.dump(output, open('../out/country_data.json', 'w'))
