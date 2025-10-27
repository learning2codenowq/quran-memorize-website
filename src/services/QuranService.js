class QuranService {
  static BASE_URL = 'https://quran.shayanshehzadqureshi.workers.dev';

  // Get all 114 surahs
  static async getAllSurahs() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/qf/chapters`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return (data.chapters || []).map(surah => ({
        id: surah.id,
        name_arabic: surah.name_arabic,
        name_simple: surah.name_simple,
        name_complex: surah.name_complex,
        revelation_place: surah.revelation_place,
        verses_count: surah.verses_count,
        pages: surah.pages,
        translated_name: surah.translated_name
      }));
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  // Get surah with verses, translation, and audio
  static async getSurahWithTranslation(surahId, reciterId = null, scriptType = 'uthmani') {
    try {
      // Map script types to API format
      const textFormatMap = {
        'uthmani': 'uthmani',
        'indopak': 'imlaei',
        'tajweed': 'tajweed'
      };
      const textFormat = textFormatMap[scriptType] || 'uthmani';
      
      // Build URL with parameters
      let url = `${this.BASE_URL}/api/qf/verses?chapter=${surahId}&perPage=300&textFormat=${textFormat}`;
      if (reciterId) {
        url += `&reciterId=${reciterId}`;
      }
      
      console.log('Fetching from URL:', url); // DEBUG
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status); // DEBUG
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Full API Response:', data); // DEBUG
      console.log('Has chapter?', !!data.chapter); // DEBUG
      console.log('Has verses?', !!data.verses); // DEBUG
      
      // Check what we actually got
      if (!data.verses) {
        console.error('No verses in response:', data);
        throw new Error('No verses returned from API');
      }

      if (!data.chapter && !data.surah) {
        console.error('No chapter/surah info in response:', data);
        throw new Error('No chapter information returned from API');
      }

      // Use whatever the API returns (chapter or surah)
      const chapterInfo = data.chapter || data.surah;

      return {
        surah: {
          id: chapterInfo.id,
          name_arabic: chapterInfo.name_arabic,
          name_simple: chapterInfo.name_simple,
          revelation_place: chapterInfo.revelation_place,
          verses_count: chapterInfo.verses_count || chapterInfo.total_ayahs,
          has_bismillah: chapterInfo.bismillah_pre || chapterInfo.has_bismillah
        },
        bismillah: data.bismillah,
        ayahs: data.verses.map(verse => ({
          id: verse.id,
          key: verse.key,
          number: verse.number,
          text: verse.text,
          translation: verse.translationHtml || '',
          audioUrl: verse.audioUrl || null,
          page_number: verse.page_number,
          juz_number: verse.juz_number
        })),
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Error fetching surah:', error);
      throw error;
    }
  }

  // Get list of reciters
  static async getReciters() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/qf/reciters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reciters');
      }
      
      const data = await response.json();
      return data.reciters || [];
    } catch (error) {
      console.error('Error fetching reciters:', error);
      return [];
    }
  }

  // Get page data for Mushaf view
  static async getPageData(pageNumber) {
    try {
      const response = await fetch(`${this.BASE_URL}/api/qf/page?pageNumber=${pageNumber}&textFormat=uthmani`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('API Response:', data); // DEBUG LOG
      
      if (!data.verses && !data.chapter) {
        console.error('Missing verses or chapter in response:', data);
        throw new Error('Invalid API response structure');
      }

      return {
        page: {
          number: data.page.number,
          total_pages: data.page.total_pages,
          juz_number: data.page.juz_number,
          hizb_number: data.page.hizb_number
        },
        verses: data.verses.map(verse => ({
          key: verse.key,
          number: verse.number,
          text: verse.text,
          translation: verse.translationHtml || '',
          juz_number: verse.juz_number,
          page_number: verse.page_number,
          hizb_number: verse.hizb_number
        }))
      };
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }
}

export default QuranService;