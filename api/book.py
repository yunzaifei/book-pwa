import urllib.request
import urllib.error
import json
import os
from bs4 import BeautifulSoup, NavigableString, Tag

headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36'}

book_list = [
    {'name': '天下豪商', 'url': 'https://www.piaotian.com/bookinfo/8/8918.html'},
    {'name': '原来我是妖二代', 'url': 'https://www.piaotian.com/bookinfo/9/9795.html'}
]


class PiaotianSpider(object):
    def __init__(self):
        self.piaotian_url_base = 'http://piaotian.com'
        self.books = []
        self.contents = []
        self.oldNum = [0, 0]
        if os.path.exists('./book.json'):
            with open('./book.json', 'r', encoding="utf-8") as f:
                # print(f.read())
                jsonf = json.loads(f.read())
                self.contents = jsonf['contents']
                for i in range(0, len(jsonf['books'])):
                    self.oldNum[i] = jsonf['books'][i]['num']

    def browser_bookInfo(self):
        for i in range(0, len(book_list)):
            html = self.browser_html(book_list[i]['url'])
            bf = BeautifulSoup(html, features="html.parser")
            img = bf.select_one('#content img[align=right]')['src']
            obj = {'id': i, 'name': book_list[i]['name'],
                   'img': img, 'num': 0, 'newTitle': ''}
            self.books.append(obj)
            to_url = bf.select_one('#content a')['href']
            print(to_url)
            self.browser_bookMenu(self, to_url, i)

    @staticmethod
    def browser_bookMenu(self, url, i):
        html = self.browser_html(url)
        bf = BeautifulSoup(html, features="html.parser")
        titles = bf.select('.centent li a')
        self.books[i]['num'] = len(titles)
        self.books[i]['newTitle'] = titles[-1].text
        for j in range(self.oldNum[i], len(titles)):
            print(titles[j].text)
            k = self.getContentIndex(self, i, j)
            self.contents.insert(k, {'id': (str(i) + '_' + str(j)), 'bookId': i,
                                  'index': j, 'title': titles[j].text, 'content': []})
            to_url = url + titles[j]['href']
            self.browser_bookContent(self, to_url, i, k)

    @staticmethod
    def getContentIndex(self, i, j):
        k = 0
        for l in range(0, i):
            k += self.books[l]['num']
        k += j
        return k


    @staticmethod
    def browser_bookContent(self, url, i, k):
        html = self.browser_html(url).decode('gb2312', 'ignore')
        # print(html)
        bf = BeautifulSoup(html, features='lxml')
        for br in bf.find_all('br'):
            next_s = br.nextSibling
            if not (next_s and isinstance(next_s, NavigableString)):
                continue
            next2_s = next_s.nextSibling
            if next2_s and isinstance(next2_s, Tag) and next2_s.name == 'br':
                text = str(next_s).strip()
                #print(text)
                self.contents[k]['content'].append(text)

    @staticmethod
    def browser_html(url):
        try:
            response = urllib.request.Request(url, headers=headers)
            result = urllib.request.urlopen(response)
            html = result.read()
            return html
        except urllib.error.HTTPError as e:
            if hasattr(e, 'code'):
                print(e.code)
        except urllib.error.URLError as e:
            if hasattr(e, 'reason'):
                print(e.reason)


if __name__ == '__main__':
    piaotian = PiaotianSpider()
    piaotian.browser_bookInfo()
    with open('./book.json', 'w', encoding="utf-8") as dump_f:
        json.dump({'books': piaotian.books,
                   'contents': piaotian.contents}, dump_f, ensure_ascii=False)
    print('----保存json文件完成！----')
