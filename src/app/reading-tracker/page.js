"use client";

import { useState, useEffect } from "react";
import { books } from "@/utils/book";
import {
  Search,
  BookOpen,
  Calendar,
  Target,
  Bell,
  X,
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  Plus,
  Trash2,
  Phone,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LoadingButton from "@/components/UI/LoadingButton";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const READING_DATA_KEY = "reading_tracker_data";

export default function ReadingTrackerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showAddCustomBookModal, setShowAddCustomBookModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [dailyPages, setDailyPages] = useState("");
  const [readingEntries, setReadingEntries] = useState([]);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [trackedBooks, setTrackedBooks] = useState([]);

  // Import-ordered-books state
  const [showImportModal, setShowImportModal] = useState(false);
  const [orderedBooks, setOrderedBooks] = useState([]);
  const [importSelected, setImportSelected] = useState([]); // ids chosen to import

  // Per-book notes / action items: { [bookId]: [{ id, text, ts }] }
  const [bookNotes, setBookNotes] = useState({});
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesBook, setNotesBook] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Custom book form
  const [customBook, setCustomBook] = useState({
    name: "",
    author: "",
    pages: "",
    image: "/default-book.jpg",
  });

  // Load saved reading data + the shopper's ordered books (cached by profile)
  useEffect(() => {
    const savedData = localStorage.getItem(READING_DATA_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setReadingEntries(parsed.entries || []);
        setTrackedBooks(parsed.trackedBooks || []);
        setBookNotes(parsed.bookNotes || {});
      } catch (e) {
        console.error("Error loading reading data", e);
      }
    }
    try {
      const ob = JSON.parse(localStorage.getItem("user_ordered_books") || "[]");
      if (Array.isArray(ob)) setOrderedBooks(ob);
    } catch {}
  }, []);

  // Open the import modal, preselecting books not already tracked
  const openImportModal = () => {
    setImportSelected(
      orderedBooks
        .filter((b) => !trackedBooks.some((t) => t.id === b.id))
        .map((b) => b.id),
    );
    setShowImportModal(true);
  };

  const toggleImportSelect = (id) => {
    setImportSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleImportOrderedBooks = () => {
    const toAdd = orderedBooks.filter(
      (b) => importSelected.includes(b.id) && !trackedBooks.some((t) => t.id === b.id),
    );
    if (!toAdd.length) {
      setShowImportModal(false);
      return;
    }
    const updated = [
      ...trackedBooks,
      ...toAdd.map((b) => ({
        id: b.id,
        name: b.name,
        author: b.author || "Unknown",
        pages: b.pages || 200,
        image: b.image || "/default-book.jpg",
        isCustom: false,
      })),
    ];
    setTrackedBooks(updated);
    saveReadingData(readingEntries, updated);
    setShowImportModal(false);
  };

  // Save reading data
  const saveReadingData = (entries, books, notes = bookNotes) => {
    localStorage.setItem(
      READING_DATA_KEY,
      JSON.stringify({
        entries: entries,
        trackedBooks: books,
        bookNotes: notes,
      }),
    );
  };

  // ── Per-book notes / action items ──
  const openNotes = (book) => {
    setNotesBook(book);
    setNoteText("");
    setShowNotesModal(true);
  };
  const addBookNote = () => {
    const text = noteText.trim();
    if (!text || !notesBook) return;
    const next = {
      ...bookNotes,
      [notesBook.id]: [
        ...(bookNotes[notesBook.id] || []),
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, ts: Date.now() },
      ],
    };
    setBookNotes(next);
    saveReadingData(readingEntries, trackedBooks, next);
    setNoteText("");
  };
  const deleteBookNote = (bookId, noteId) => {
    const next = {
      ...bookNotes,
      [bookId]: (bookNotes[bookId] || []).filter((n) => n.id !== noteId),
    };
    setBookNotes(next);
    saveReadingData(readingEntries, trackedBooks, next);
  };

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setShowBookModal(true);
    setDailyPages("");
  };

  const handleAddCustomBook = () => {
    if (!customBook.name) {
      alert("Please enter book name");
      return;
    }

    const newBook = {
      id: `custom_${Date.now()}`,
      name: customBook.name,
      author: customBook.author || "Unknown",
      pages: customBook.pages ? parseInt(customBook.pages) : 200,
      image: customBook.image || "/default-book.jpg",
      isCustom: true,
    };

    setSelectedBook(newBook);
    setShowAddCustomBookModal(false);
    setShowBookModal(true);
    setDailyPages("");
    setCustomBook({
      name: "",
      author: "",
      pages: "",
      image: "/default-book.jpg",
    });
  };

  const handleAddReadingEntry = () => {
    if (!selectedBook || !dailyPages || parseInt(dailyPages) <= 0) return;

    const pagesRead = parseInt(dailyPages);
    const today = new Date().toISOString().split("T")[0];

    // Check if entry already exists for today
    const existingEntryIndex = readingEntries.findIndex(
      (entry) => entry.bookId === selectedBook.id && entry.date === today,
    );

    let newEntries;
    if (existingEntryIndex !== -1) {
      newEntries = [...readingEntries];
      newEntries[existingEntryIndex].pages += pagesRead;
    } else {
      newEntries = [
        ...readingEntries,
        {
          id: Date.now(),
          bookId: selectedBook.id,
          bookName: selectedBook.name,
          pages: pagesRead,
          date: today,
          timestamp: Date.now(),
        },
      ];
    }

    // Add to tracked books if not already
    let updatedTrackedBooks = [...trackedBooks];
    if (!trackedBooks.some((b) => b.id === selectedBook.id)) {
      updatedTrackedBooks.push({
        id: selectedBook.id,
        name: selectedBook.name,
        author: selectedBook.author,
        pages: selectedBook.pages || 200,
        image: selectedBook.image,
        isCustom: selectedBook.isCustom || false,
      });
    }

    setReadingEntries(newEntries);
    setTrackedBooks(updatedTrackedBooks);
    saveReadingData(newEntries, updatedTrackedBooks);
    setShowBookModal(false);
    setSelectedBook(null);
    setDailyPages("");
  };

  // Delete tracked book and all its entries
  const handleDeleteBook = () => {
    if (!bookToDelete) return;

    // Remove all entries for this book
    const newEntries = readingEntries.filter(
      (entry) => entry.bookId !== bookToDelete.id,
    );

    // Remove book from tracked books
    const newTrackedBooks = trackedBooks.filter(
      (book) => book.id !== bookToDelete.id,
    );

    setReadingEntries(newEntries);
    setTrackedBooks(newTrackedBooks);
    saveReadingData(newEntries, newTrackedBooks);
    setShowDeleteConfirmModal(false);
    setBookToDelete(null);
  };

  // Delete single reading entry
  const handleDeleteEntry = (entryId) => {
    const newEntries = readingEntries.filter((entry) => entry.id !== entryId);
    setReadingEntries(newEntries);
    saveReadingData(newEntries, trackedBooks);
  };

  const handleNotifyMe = () => {
    if (!notifyPhone || notifyPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const message = `*📚 READING TRACKER - THEBOOKX*\n\nI want to receive daily reading reminders at 11 PM for my reading goal.\n\n📖 Book: ${selectedBook?.name}\n👤 Name: Reading Tracker User\n📞 Phone: +91${notifyPhone}\n\nPlease send me daily reminders to complete my reading goal.🙏`;

    window.open(
      `https://wa.me/917710892108?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setShowNotifyModal(false);
    setNotifyPhone("");
  };

  // Calculate total pages read for a book
  const getTotalPagesRead = (bookId) => {
    return readingEntries
      .filter((entry) => entry.bookId === bookId)
      .reduce((sum, entry) => sum + entry.pages, 0);
  };

  // Get book total pages
  const getBookTotalPages = (book) => {
    if (!book.pages) return 200;
    if (typeof book.pages === "string" && book.pages.includes("-")) {
      const pages = parseInt(book.pages.split("-")[1]);
      return isNaN(pages) ? 200 : pages;
    }
    const pages = parseInt(book.pages);
    return isNaN(pages) ? 200 : pages;
  };

  // Calculate progress percentage
  const getProgressPercentage = (book) => {
    const totalRead = getTotalPagesRead(book.id);
    const totalPages = getBookTotalPages(book);
    const percentage = Math.round((totalRead / totalPages) * 100);
    return isNaN(percentage) ? 0 : Math.min(percentage, 100);
  };

  // Get reading streak
  const getReadingStreak = () => {
    const dates = [...new Set(readingEntries.map((e) => e.date))].sort();
    let streak = 0;
    let currentDate = new Date();

    for (let i = dates.length - 1; i >= 0; i--) {
      const entryDate = new Date(dates[i]);
      const diffDays = Math.floor(
        (currentDate - entryDate) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const totalPagesRead = readingEntries.reduce((sum, e) => sum + e.pages, 0);

  return (
    <div className="">
      <div className="section-1200 flex flex-col gap-24">
        {/* Header */}
        <div className="tracker-header flex flex-col gap-12">
          <Link href="/" className=" flex flex-row gap-4 items-center font-16">
            <ArrowLeft size={24} />
            Go back
          </Link>
          <div className="flex flex-col">
            <h1 className="font-24">Reading Tracker</h1>
            <p className="font-12">
              Track your daily reading progress and stay consistent
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="tracker-stats">
          <div className="stat-card">
            <div>
              <div className="stat-value">{readingEntries.length}</div>
              <div className="stat-label">Reading Sessions</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">{totalPagesRead}</div>
              <div className="stat-label">Pages Read</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">{getReadingStreak()}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">{trackedBooks.length}</div>
              <div className="stat-label">Books Tracking</div>
            </div>
          </div>
        </div>

        <div className="dashed-border my-20"></div>

        {/* Import ordered books — quickest way to start tracking */}
        <button
          className="rt-import-cta"
          onClick={openImportModal}
        >
          <BookOpen size={18} />
          <span>
            Import my ordered books
            {orderedBooks.length > 0 && (
              <em className="rt-import-count">{orderedBooks.length}</em>
            )}
          </span>
        </button>

        {/* Search Section */}
        <div className="flex flex-col gap-4">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-book width100"
              placeholder="Search for a book to start tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="flex flex-row justify-center font-12">or</span>

          <button
            className="sec-big-btn flex flex-row gap-4 justify-center items-center"
            onClick={() => setShowAddCustomBookModal(true)}
          >
            <Plus size={18} />
            Add a custom book
          </button>
        </div>

        {/* Empty state — only when nothing is being tracked and no search */}
        {trackedBooks.length === 0 && !searchQuery && (
          <div className="rt-empty">
            <BookOpen size={34} />
            <h3>Start your reading journey</h3>
            <p>
              Import the books you've ordered, search our catalogue, or add your
              own — then log your daily pages to build a streak.
            </p>
            <button className="pri-big-btn rt-empty-btn" onClick={openImportModal}>
              <BookOpen size={16} /> Import my ordered books
            </button>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="search-results">
            <span className="font-16 dark-50">
              {filteredBooks.length} books found
            </span>
            <div className="books-list">
              {filteredBooks.slice(0, 10).map((book) => (
                <div
                  key={book.id}
                  className="search-result-item"
                  onClick={() => handleBookSelect(book)}
                >
                  <div className="result-image">
                    <Image
                      src={book.image}
                      alt={book.name}
                      width={40}
                      height={55}
                      style={{ objectFit: "cover", borderRadius: "6px" }}
                    />
                  </div>
                  <div className="result-info">
                    <div className="result-name">{book.name}</div>
                    <div className="result-author">{book.author}</div>
                  </div>
                  <div className="sec-mid-btn">+ Add</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracked Books Section */}
        {trackedBooks.length > 0 && (
          <div className="flex flex-col gap-12">
            <h3 className="font-24">Currently Tracking</h3>
            <div className="tracked-books-grid">
              {trackedBooks.map((book) => {
                const totalRead = getTotalPagesRead(book.id);
                const totalPages = getBookTotalPages(book);
                const progress = getProgressPercentage(book);
                const isCompleted = totalRead >= totalPages;

                return (
                  <div key={book.id} className="tracked-book-card">
                    <div className="tracked-book-image">
                      <Image
                        src={book.image}
                        alt={book.name}
                        width={60}
                        height={85}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                    </div>
                    <div className="flex flex-col gap-12 width100">
                      <div className="flex flex-col">
                        <div className="font-16">{book.name}</div>

                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className=" font-14">
                          {totalRead} / {totalPages} pages ({progress}%
                          completed)
                        </div>
                        {isCompleted && (
                          <div className="completed-badge">
                            <CheckCircle size={14} />
                            Completed!
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row gap-12">
                        <button
                          className="sec-mid-btn"
                          onClick={() => handleBookSelect(book)}
                        >
                          + Add Entry
                        </button>
                        <button
                          className="sec-mid-btn rt-notes-btn"
                          onClick={() => openNotes(book)}
                          title="Key points & action items"
                        >
                          <StickyNote size={15} /> Notes
                          {(bookNotes[book.id] || []).length > 0 && (
                            <span className="rt-notes-count">
                              {bookNotes[book.id].length}
                            </span>
                          )}
                        </button>
                        <button
                          className="pri-big-btn"
                          onClick={() => {
                            setBookToDelete(book);
                            setShowDeleteConfirmModal(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reading History with Delete Option */}
        {readingEntries.length > 0 && (
          <div className="flex flex-col gap-12">
            <h3 className="section-title">Reading History</h3>
            <div className="flex flex-col gap-12">
              {[...readingEntries]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="history-item flex flex-row justify-between items-center"
                  >
                    <div>
                      <div className="font-20 weight-600">{entry.bookName}</div>
                      <div className="flex flex-row font-14 gap-12">
                        <div className="history-date">
                          {new Date(entry.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        {"|"}
                        <div className="history-pages">
                          {entry.pages} pages added
                        </div>
                      </div>
                    </div>

                    <button
                      className="sec-mid-btn flex flex-row items-center justify-center"
                      style={{ maxHeight: "fit-content" }}
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="dashed-border my-20"></div>

        {/* Tips Section */}
        <div className="tracker-tips">
          <div className="tips-content">
            <h4 className="font-24">Reading Tip</h4>
            <p>
              Reading just 20 pages a day means you'll finish 7,300 pages in a
              year, that's about 30 books!
            </p>
          </div>
        </div>
      </div>

      {/* Add Reading Entry Modal */}
      <AnimatePresence>
        {showBookModal && selectedBook && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookModal(false)}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Add Reading Entry</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowBookModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className=" flex flex-col gap-12">
                <div className="input-group text-center">
                  <Image
                    src={selectedBook.image}
                    alt={selectedBook.name}
                    width={80}
                    height={110}
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      margin: "0 auto",
                    }}
                  />
                </div>

                <div className="input-group text-center">
                  <h3 className="font-16 weight-600">{selectedBook.name}</h3>
                  <p className="font-12 dark-50">{selectedBook.author}</p>
                  <p className="font-12 dark-50 mt-4">
                    Total Pages: {getBookTotalPages(selectedBook)}
                  </p>
                  <p className="font-12 green mt-4">
                    Already read: {getTotalPagesRead(selectedBook.id)} pages
                  </p>
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4">
                    <BookOpen size={14} />
                    Pages read today <span className="red">*</span>
                  </label>
                  <input
                    type="number"
                    className="sec-mid-btn"
                    placeholder="Enter number of pages"
                    value={dailyPages}
                    onChange={(e) => setDailyPages(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="flex flex-col gap-12 mt-16">
                  <LoadingButton
                    className="pri-big-btn width100"
                    onClick={handleAddReadingEntry}
                    disabled={!dailyPages || parseInt(dailyPages) <= 0}
                  >
                    Save Reading Progress
                  </LoadingButton>

                  <button
                    className="sec-mid-btn width100 flex items-center justify-center gap-8"
                    onClick={() => {
                      setShowBookModal(false);
                      setShowNotifyModal(true);
                    }}
                  >
                    <Bell size={16} />
                    Get Daily Reminders
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Ordered Books Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              className="bill-modal rt-import-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex flex-row gap-8 items-center">
                  <BookOpen size={18} /> Import your ordered books
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowImportModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              {orderedBooks.length === 0 ? (
                <div className="rt-import-empty">
                  <p>
                    We couldn't find any ordered books yet. Open your{" "}
                    <Link href="/profile" className="orange">
                      Profile
                    </Link>{" "}
                    and view your orders first — they'll appear here to import.
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-12 dark-50" style={{ margin: "4px 0 10px" }}>
                    Select the books you'd like to track:
                  </p>
                  <div className="rt-import-list">
                    {orderedBooks.map((b) => {
                      const already = trackedBooks.some((t) => t.id === b.id);
                      const checked = importSelected.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className={`rt-import-item ${already ? "already" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={already || checked}
                            disabled={already}
                            onChange={() => toggleImportSelect(b.id)}
                          />
                          <span className="rt-import-cover">
                            {b.image && (
                              <img src={b.image} alt={b.name} loading="lazy" />
                            )}
                          </span>
                          <span className="rt-import-meta">
                            <span className="rt-import-name">{b.name}</span>
                            {b.author && (
                              <span className="rt-import-author">
                                {b.author}
                              </span>
                            )}
                          </span>
                          {already && (
                            <span className="rt-import-tag">Tracking</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <button
                    className="pri-big-btn width100"
                    onClick={handleImportOrderedBooks}
                    style={{ marginTop: 14 }}
                  >
                    Add{" "}
                    {
                      importSelected.filter(
                        (id) => !trackedBooks.some((t) => t.id === id),
                      ).length
                    }{" "}
                    book(s) to tracker
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-book Notes / Action Items Modal */}
      <AnimatePresence>
        {showNotesModal && notesBook && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotesModal(false)}
          >
            <motion.div
              className="bill-modal rt-notes-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex flex-col">
                  <span className="flex flex-row gap-8 items-center">
                    <StickyNote size={18} /> Key points & action items
                  </span>
                  <span className="font-12 dark-50">{notesBook.name}</span>
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowNotesModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="rt-notes-list">
                {(bookNotes[notesBook.id] || []).length === 0 && (
                  <div className="rt-notes-empty">
                    No notes yet. Jot down key takeaways and action items from
                    this book below.
                  </div>
                )}
                {(bookNotes[notesBook.id] || []).map((n) => {
                  const d = new Date(n.ts);
                  return (
                    <div className="rt-note-item" key={n.id}>
                      <p className="rt-note-text">{n.text}</p>
                      <div className="rt-note-foot">
                        <span>
                          {d.toLocaleDateString("en-IN", { weekday: "short" })},{" "}
                          {d.toLocaleDateString("en-IN")}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteBookNote(notesBook.id, n.id)}
                          aria-label="Delete note"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rt-notes-input-row">
                <textarea
                  className="search-book width100 rt-notes-input"
                  placeholder="Add a key point or action item…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                      addBookNote();
                  }}
                />
                <button
                  type="button"
                  className="pri-big-btn"
                  onClick={addBookNote}
                  disabled={!noteText.trim()}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Book Modal */}
      <AnimatePresence>
        {showAddCustomBookModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCustomBookModal(false)}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Add Custom Book</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowAddCustomBookModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="address-form-content">
                <div className="input-group">
                  <label>
                    Book Name <span className="red">*</span>
                  </label>
                  <input
                    type="text"
                    className="sec-mid-btn"
                    placeholder="Enter book name"
                    value={customBook.name}
                    onChange={(e) =>
                      setCustomBook({ ...customBook, name: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Author</label>
                  <input
                    type="text"
                    className="sec-mid-btn"
                    placeholder="Enter author name"
                    value={customBook.author}
                    onChange={(e) =>
                      setCustomBook({ ...customBook, author: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Total Pages (Optional)</label>
                  <input
                    type="number"
                    className="sec-mid-btn"
                    placeholder="Enter total pages"
                    value={customBook.pages}
                    onChange={(e) =>
                      setCustomBook({ ...customBook, pages: e.target.value })
                    }
                    min="1"
                  />
                </div>

                <div className="flex flex-col gap-12 mt-16">
                  <LoadingButton
                    className="pri-big-btn width100"
                    onClick={handleAddCustomBook}
                    disabled={!customBook.name}
                  >
                    Add & Continue
                  </LoadingButton>

                  <button
                    className="sec-mid-btn width100"
                    onClick={() => setShowAddCustomBookModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && bookToDelete && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirmModal(false)}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Remove Book</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowDeleteConfirmModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="address-form-content text-center">
                <div className="input-group">
                  <Trash2
                    size={48}
                    className="red"
                    style={{ margin: "0 auto" }}
                  />
                </div>

                <div className="input-group text-center">
                  <h3 className="font-16 weight-600">
                    Remove "{bookToDelete.name}"?
                  </h3>
                  <p className="font-12 dark-50 mt-8">
                    This will delete all reading progress and history for this
                    book. This action cannot be undone.
                  </p>
                </div>

                <div className="flex flex-col gap-12 mt-16">
                  <LoadingButton
                    className="pri-big-btn width100"
                    style={{ background: "#dc2626" }}
                    onClick={handleDeleteBook}
                  >
                    Yes, Remove Book
                  </LoadingButton>

                  <button
                    className="sec-mid-btn width100"
                    onClick={() => setShowDeleteConfirmModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notify Modal */}
      <AnimatePresence>
        {showNotifyModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifyModal(false)}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">
                  Get Daily Reading Reminders
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowNotifyModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div className="address-form-content flex flex-col gap-12">
                <div className="delivery-info-section">
                  <div className="flex flex-col gap-8 p-12 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-8">
                      <Clock size={18} className="orange" />
                      <span className="font-12">
                        Get reminded every day at 11 PM
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <Bell size={18} className="green" />
                      <span className="font-12">
                        Never miss your daily reading goal
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <Zap size={18} className="green" />
                      <span className="font-12">
                        Reply STOP anytime to unsubscribe
                      </span>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4">
                    <Phone size={14} />
                    WhatsApp Number <span className="red">*</span>
                  </label>
                  <input
                    type="tel"
                    className="sec-mid-btn"
                    placeholder="Enter 10-digit mobile number"
                    value={notifyPhone}
                    maxLength={10}
                    onChange={(e) =>
                      setNotifyPhone(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>

                <div className="flex flex-col gap-12 mt-16">
                  <LoadingButton
                    className="pri-big-btn width100"
                    onClick={handleNotifyMe}
                    disabled={!notifyPhone || notifyPhone.length !== 10}
                  >
                    <Bell size={16} />
                    Subscribe to Reminders
                  </LoadingButton>

                  <button
                    className="sec-mid-btn width100"
                    onClick={() => setShowNotifyModal(false)}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
