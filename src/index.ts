import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_URL =
  "https://www.guoxinlanqiao.com/api/news/find?status=1&project=dasai&progid=20&pageno=1&pagesize=10";
// Configure Bark URL via BARK_URL environment variable or by changing BARK_PLACEHOLDER if needed.
const BARK_PLACEHOLDER = "https://api.day.app/BARK_TOKEN"; // Default placeholder
const BARK_URL: string =
  process.env.BARK_URL || BARK_PLACEHOLDER; // Fallback to the existing URL if env var is not set

interface NewsItem {
  nnid: number;
  appid: string;
  programaId: number;
  title: string;
  img: string;
  creatTime: string;
  publishTime: string;
  nstatus: number;
  author: string;
  extdata: string;
  sort: number;
  pv: number;
  issync: number;
  synopsis: string;
  istop: number;
  statusName: string;
  programaName: string;
}

interface ApiResponse {
  code: number;
  msg: string;
  succ: boolean;
  total: number;
  datalist: NewsItem[];
}

let lastProcessedNnid = 1799; // Initialize with the minimum nnid to check against

async function fetchNews(): Promise<NewsItem[]> {
  try {
    const response = await axios.get<ApiResponse>(NEWS_API_URL);
    if (response.data && response.data.succ && response.data.datalist) {
      return response.data.datalist;
    }
    console.error("Failed to fetch news or malformed response:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

async function sendBarkNotification(title: string, body: string) {
  if (BARK_URL === BARK_PLACEHOLDER && process.env.BARK_URL === undefined) {
    console.warn(
      `Bark URL is using a placeholder or a hardcoded fallback and BARK_URL environment variable is not set. Please consider setting the BARK_URL environment variable. Current URL: ${BARK_URL}`
    );
    // Allow to proceed if it's the hardcoded fallback, but warn if it's still the placeholder.
    if (BARK_URL === BARK_PLACEHOLDER) return;
  }
  try {
    const barkFullUrl = `${BARK_URL}/${encodeURIComponent(
      "蓝桥杯新资讯"
    )}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`;
    await axios.get(barkFullUrl);
    console.log(`Notification sent: ${title}`);
  } catch (error) {
    console.error("Error sending Bark notification:", error);
  }
}

async function checkForNewNews() {
  console.log(
    `[${new Date().toLocaleString()}] Checking for new news... Last processed nnid: ${lastProcessedNnid}`
  );
  const newsItems = await fetchNews();
  const newRelevantNews: NewsItem[] = [];

  for (const item of newsItems) {
    if (item.nnid > lastProcessedNnid) {
      newRelevantNews.push(item);
    }
  }

  // Sort by nnid to process in order and update lastProcessedNnid correctly
  newRelevantNews.sort((a, b) => a.nnid - b.nnid);

  for (const item of newRelevantNews) {
    console.log(`Found new news: ${item.title} (nnid: ${item.nnid})`);
    await sendBarkNotification(
      `${item.title}`,
      item.synopsis.substring(0, 100) + "..."
    );
    lastProcessedNnid = item.nnid; // Update after successful notification
  }

  if (newRelevantNews.length === 0) {
    console.log("No new news found greater than last processed nnid.");
  }
}

function startPolling() {
  console.log("Starting Lanqiao news polling service...");
  checkForNewNews(); // Initial check
  setInterval(checkForNewNews, 60 * 1000); // Poll every 60 seconds
}

startPolling();
