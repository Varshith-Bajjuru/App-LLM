const axios = require("axios");
const Chat = require("../models/chatModel");
const { v4: uuidv4 } = require("uuid");

const PUBMED_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const MAX_RESULTS = 3;

exports.handleMedicalQuery = async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;

    const searchParams = new URLSearchParams({
      db: "pubmed",
      term: prompt,
      retmode: "json",
      retmax: MAX_RESULTS,
      sort: "relevance",
      field: "title,abstract",
    });

    const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?${searchParams}`;
    const searchResponse = await axios.get(searchUrl, { timeout: 10000 });

    if (!searchResponse.data?.esearchresult?.idlist?.length) {
      return res.status(404).json({
        error: "No relevant medical articles found",
        shouldFallback: true,
      });
    }

    const summaryParams = new URLSearchParams({
      db: "pubmed",
      id: searchResponse.data.esearchresult.idlist.join(","),
      retmode: "json",
    });

    const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi?${summaryParams}`;
    const summaryResponse = await axios.get(summaryUrl, { timeout: 10000 });

    const articles = Object.values(summaryResponse.data.result)
      .slice(1)
      .filter((article) => article.title); // Only include articles with titles

    if (articles.length === 0) {
      return res.status(404).json({
        error: "No complete medical articles found",
        shouldFallback: true,
      });
    }

    // Step 3: Format response
    let botResponse = "Here's what I found from medical research:\n\n";

    articles.forEach((article, index) => {
      botResponse += `**${index + 1}. ${article.title}**\n`;
      if (article.authors) {
        botResponse += `Authors: ${article.authors.map((a) => a.name).join(", ")}\n`;
      }
      if (article.pubdate) {
        botResponse += `Published: ${article.pubdate}\n`;
      }
      if (article.source) {
        botResponse += `Journal: ${article.source}\n`;
      }
      if (article.abstract) {
        botResponse += `Abstract: ${article.abstract}\n\n`;
      } else {
        botResponse += `[No abstract available]\n\n`;
      }
    });

    botResponse +=
      "\n*This information is from PubMed and should not replace professional medical advice.*";

    // Prepare chat data with references
    const chatData = {
      prompt,
      response: botResponse,
      isMedical: true,
      references: articles.map((article) => ({
        title: article.title,
        authors: article.authors?.map((a) => a.name),
        journal: article.source,
        pubdate: article.pubdate,
        pmid: article.uid,
        url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}`,
      })),
    };

    // Save to database
    let chat;
    if (sessionId) {
      chat = await Chat.findOneAndUpdate(
        { sessionId, userId: req.user.id },
        {
          $push: { messages: chatData },
          $set: {
            updatedAt: Date.now(),
            isMedical: true, // Mark entire chat as medical
          },
        },
        { new: true }
      );
    } else {
      chat = new Chat({
        sessionId: uuidv4(),
        userId: req.user.id,
        title: `Medical: ${prompt.slice(0, 20)}...`,
        messages: [chatData],
        isMedical: true,
      });
      await chat.save();
    }

    // Broadcast update
    if (req.app.locals.broadcastUpdate) {
      req.app.locals.broadcastUpdate({
        action: sessionId ? "UPDATE" : "NEW",
        chat: {
          id: chat.sessionId,
          title: chat.title,
          isMedical: true,
          messages: chat.messages.map((m) => ({
            text: m.response,
            isUser: false,
            timestamp: m.timestamp,
            isMedical: true,
          })),
          timestamp: chat.updatedAt,
        },
      });
    }

    res.status(200).json({
      text: botResponse,
      isMedical: true,
      sessionId: chat.sessionId,
      references: chatData.references,
    });
  } catch (error) {
    console.error("PubMed API error:", error.message);

    // Fallback to Gemini
    res.status(503).json({
      error: "Medical service unavailable",
      shouldFallback: true,
    });
  }
};
