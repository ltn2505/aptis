import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Headphones, BookOpen, Info, AlertCircle, User } from 'lucide-react';

/** Màu chủ đề P3 Listening (dropdown khớp speaker) */
const MATCH_TOPIC_PALETTE = {
  indigo: {
    header: 'bg-indigo-600',
    rowHover: 'hover:border-indigo-100',
    selectFocus: 'focus:border-indigo-400',
    keyword: 'text-indigo-700',
    acronymTile: 'bg-indigo-600',
  },
  sky: {
    header: 'bg-sky-600',
    rowHover: 'hover:border-sky-200',
    selectFocus: 'focus:border-sky-400',
    keyword: 'text-sky-700',
    acronymTile: 'bg-sky-600',
  },
  emerald: {
    header: 'bg-emerald-600',
    rowHover: 'hover:border-emerald-200',
    selectFocus: 'focus:border-emerald-400',
    keyword: 'text-emerald-800',
    acronymTile: 'bg-emerald-600',
  },
  rose: {
    header: 'bg-rose-600',
    rowHover: 'hover:border-rose-200',
    selectFocus: 'focus:border-rose-400',
    keyword: 'text-rose-800',
    acronymTile: 'bg-rose-600',
  },
  violet: {
    header: 'bg-violet-600',
    rowHover: 'hover:border-violet-200',
    selectFocus: 'focus:border-violet-400',
    keyword: 'text-violet-800',
    acronymTile: 'bg-violet-600',
  },
  amber: {
    header: 'bg-amber-600',
    rowHover: 'hover:border-amber-200',
    selectFocus: 'focus:border-amber-400',
    keyword: 'text-amber-900',
    acronymTile: 'bg-amber-600',
  },
  fuchsia: {
    header: 'bg-fuchsia-600',
    rowHover: 'hover:border-fuchsia-200',
    selectFocus: 'focus:border-fuchsia-400',
    keyword: 'text-fuchsia-900',
    acronymTile: 'bg-fuchsia-600',
  },
  teal: {
    header: 'bg-teal-600',
    rowHover: 'hover:border-teal-200',
    selectFocus: 'focus:border-teal-400',
    keyword: 'text-teal-900',
    acronymTile: 'bg-teal-600',
  },
  cyan: {
    header: 'bg-cyan-600',
    rowHover: 'hover:border-cyan-200',
    selectFocus: 'focus:border-cyan-400',
    keyword: 'text-cyan-900',
    acronymTile: 'bg-cyan-600',
  },
  orange: {
    header: 'bg-orange-600',
    rowHover: 'hover:border-orange-200',
    selectFocus: 'focus:border-orange-400',
    keyword: 'text-orange-900',
    acronymTile: 'bg-orange-600',
  },
  pink: {
    header: 'bg-pink-600',
    rowHover: 'hover:border-pink-200',
    selectFocus: 'focus:border-pink-400',
    keyword: 'text-pink-900',
    acronymTile: 'bg-pink-600',
  },
  lime: {
    header: 'bg-lime-600',
    rowHover: 'hover:border-lime-200',
    selectFocus: 'focus:border-lime-400',
    keyword: 'text-lime-900',
    acronymTile: 'bg-lime-600',
  },
};

/** Đủ đáp án đúng cho mọi ô của section hiện tại (kéo thả, điền chỗ trống, hoặc dropdown P3). */
function isSectionComplete(items, answers) {
  if (!items.length || items[0]?.isStatic) return false;

  const mdItems = items.filter(i => i.type === 'matching_dropdown');
  if (mdItems.length > 0) {
    return mdItems.every(item => item.statements.every(st => answers[st.id] === st.speaker));
  }

  const hasWordGaps = items.some(i =>
    (i.content || []).some(p => p && typeof p === 'object' && p.word)
  );
  if (hasWordGaps) {
    let total = 0;
    let filled = 0;
    items.forEach(item => {
      (item.content || []).forEach((p, idx) => {
        if (p && typeof p === 'object' && p.word) {
          total++;
          const gapId = `${item.id}-gap-${idx}`;
          if (answers[gapId]) filled++;
        }
      });
    });
    return total > 0 && filled === total;
  }

  const listenSingle = items.filter(
    i =>
      !i.isStatic &&
      !i.type &&
      !(i.content || []).some(p => p && typeof p === 'object' && p.word)
  );
  if (listenSingle.length > 0) {
    return listenSingle.every(i => answers[i.id]);
  }

  return false;
}

/** Định nghĩa ngoài App để React không coi mỗi lần render là component type mới (tránh remount → cuộn trang nhảy về đầu khi đổi dropdown P3). */
function QuestionCard({ item, answers, skill, onDrop, onDropdownChange }) {
  const isCorrect = !!answers[item.id];

  if (item.type === 'matching_dropdown') {
    const pal = MATCH_TOPIC_PALETTE[item.topicColor] || MATCH_TOPIC_PALETTE.indigo;
    const allCorrect = item.statements.every(st => answers[st.id] === st.speaker);
    const boldStatement = (text) =>
      text.replace(/\*\*(.*?)\*\*/g, `<b class="font-bold ${pal.keyword}">$1</b>`);
    return (
      <div className="space-y-6 mb-12 border-b border-slate-200 pb-12 last:border-0 last:mb-0 scroll-mt-24">
        <div className={`${pal.header} p-6 rounded-[32px] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Chủ đề bài nghe</div>
            <h3 className="text-2xl font-black italic">{item.topic}</h3>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30 backdrop-blur-sm shrink-0">
             <span className="text-sm font-bold flex items-center gap-2">
               <User className="w-4 h-4 shrink-0" /> {item.opener}
             </span>
          </div>
        </div>

        <div className="space-y-4">
          {item.statements.map((st, idx) => (
            <div key={st.id} className={`bg-white p-6 rounded-[28px] border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${answers[st.id] === st.speaker ? 'border-green-400 bg-green-50/30' : `border-slate-100 shadow-sm ${pal.rowHover}`}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${answers[st.id] === st.speaker ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {idx + 1}
                </div>
                <p className="text-lg font-bold text-slate-700 leading-tight" dangerouslySetInnerHTML={{ __html: boldStatement(st.text) }} />
              </div>
              <div className="shrink-0 min-w-[160px] w-full md:w-auto">
                  <select 
                      value={answers[st.id] || ''}
                      onChange={(e) => onDropdownChange(st.id, e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl font-bold text-sm outline-none transition-all cursor-pointer border-2 
                          ${answers[st.id] === st.speaker ? 'bg-green-500 text-white border-green-500' : `bg-slate-50 text-slate-600 border-slate-200 ${pal.selectFocus}`}`}
                  >
                      <option value="" disabled>-- Chọn --</option>
                      <option value="Man">Man</option>
                      <option value="Woman">Woman</option>
                      <option value="Both">Both</option>
                  </select>
              </div>
            </div>
          ))}
        </div>

        {allCorrect && (
          <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[32px] animate-in slide-in-from-bottom-4 duration-500 mt-4">
            <div className="flex items-center gap-3 mb-3 text-amber-700">
              <Info className="w-6 h-6 shrink-0" />
              <h4 className="font-black uppercase tracking-wider text-sm">Cách nhớ (Mnemonic)</h4>
            </div>
            <p className="text-xl font-black text-slate-800 italic mb-1 tracking-tight">"{item.mnemonic}"</p>
            {item.mnemonicNote && (
              <p className="text-sm font-semibold text-slate-600 mb-3 leading-snug">{item.mnemonicNote}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {item.acronym.split('').map((char, i) => (
                <span key={i} className={`w-10 h-10 ${pal.acronymTile} text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md`}>{char}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (item.isStatic) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] shadow-xl border border-slate-100 p-12 text-center animate-in fade-in duration-700">
            <AlertCircle className="w-20 h-20 text-indigo-500 mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Thông tin tham khảo</h3>
            <p className="text-lg text-slate-500 font-bold bg-indigo-50 px-8 py-4 rounded-2xl border-2 border-indigo-100 inline-block">
                không có đáp án chỉ tham khảo ở đề cương
            </p>
        </div>
      );
  }

  const isFillGaps =
    item.content &&
    (skill === 'Reading' || (skill === 'Listening' && item.part === 4));

  if (isFillGaps) {
    const isListeningP4 = skill === 'Listening' && item.part === 4;
    return (
      <div
        className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm leading-relaxed text-lg mb-4 ${
          isListeningP4 ? 'ring-2 ring-violet-100' : ''
        }`}
      >
        {item.topic && (
          <div
            className={`text-xs font-black uppercase tracking-widest mb-2 ${
              isListeningP4 ? 'text-violet-600' : 'text-indigo-400'
            }`}
          >
            {item.topic}
          </div>
        )}
        {item.prompt && (
          <div className="text-sm text-slate-400 italic mb-2 font-medium">{item.prompt}</div>
        )}
        {isListeningP4 && (
          <div className="text-sm font-black text-slate-700 mb-3 uppercase tracking-wide">Câu hỏi</div>
        )}
        <div className="flex flex-wrap items-center gap-y-2">
          {item.content.map((p, idx) => {
            if (typeof p === 'string') return <span key={idx} className="mr-1">{p}</span>;
            const gapId = `${item.id}-gap-${idx}`;
            return (
              <div
                key={idx}
                id={`drop-${gapId}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(gapId, p.word)}
                onClick={() => onDrop(gapId, p.word)}
                className={`drop-zone mx-1 min-w-[100px] border-2 transition-all ${
                  answers[gapId]
                    ? 'correct border-solid bg-green-50'
                    : 'border-dashed border-slate-200 hover:border-indigo-300'
                }`}
              >
                {answers[gapId] || ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-100">
      <div className="flex-1">
        <div className="text-lg font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: item.q.replace(/\*\*(.*?)\*\*/g, '<b class="text-indigo-600 font-bold">$1</b>') }} />
        <div className="text-sm text-slate-400 mt-1 italic font-medium opacity-80">{item.t}</div>
      </div>
      <div id={`drop-${item.id}`} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(item.id, item.a)} onClick={() => onDrop(item.id, item.a)} className={`drop-zone shrink-0 min-w-[160px] border-2 ${isCorrect ? 'correct border-solid' : 'border-dashed border-slate-200'}`}>{answers[item.id] || ""}</div>
    </div>
  );
}

const App = () => {
  // --- TOÀN BỘ DỮ LIỆU ---
  const initialData = {
    Reading: [
      { id: 'r1', part: 1, section: 1, content: ["Buổi sáng (", { word: "morning" }, ") bạn bè (", { word: "friends" }, ") rời đi (", { word: "leave" }, "), tốt (", { word: "good" }, ") nhất là phải mang theo đồ ăn (", { word: "food" }, ")"] },
      { id: 'r2', part: 1, section: 1, content: ["Đến nhà ga (", { word: "station" }, ") gặp đèn đỏ thì dừng lại (", { word: "stop" }, "), gặp đèn xanh (", { word: "green" }, ") thì bạn sẽ được đi ăn tối (", { word: "dinner" }, ") và xem ", { word: "films" }] },
      { id: 'r3', part: 1, section: 1, content: ["Tình yêu (", { word: "love" }, ") không hề nhỏ (", { word: "small" }, ") bé, nó không thể mua được ở cửa hàng (", { word: "shop" }, "), nên người ta (", { word: "people" }, ") cần phải được thăm hỏi (", { word: "visit" }, ") thường xuyên"] },
      { id: 'r4', part: 1, section: 1, content: ["Tôi sẽ ở lại (", { word: "staying" }, ") vườn (", { word: "garden" }, ") để trông bọn trẻ (", { word: "children" }, "), sau đó tôi sẽ đi thăm (", { word: "visit" }, ") người già (", { word: "old" }, ")"] },
      { id: 'r5', part: 2, section: 1, content: ["Lúc 10 giờ (", { word: "10 am" }, "), chương trình kết thúc (", { word: "end" }, ") thì nhân viên (", { word: "staff" }, ") đến thăm (", { word: "visit" }, ") và mang theo đồ ăn (", { word: "meal" }, ")"] },
      { id: 'r6', part: 2, section: 1, content: ["Cha mẹ (", { word: "parents" }, ") ở Mỹ (", { word: "USA" }, ") thường đi theo nhóm (", { word: "team" }, ") để du lịch (", { word: "travelled" }, ") họ mang theo cây (", { word: "plants" }, ") và động vật (", { word: "animal" }, ")"] },
      { id: 'r7', part: 2, section: 1, content: ["Được người dân địa phương (", { word: "local" }, ") ủng hộ, vì vậy (", { word: "because" }, ") chương trình sẽ bắt đầu (", { word: "begin" }, "), tất cả nhân viên (", { word: "staff" }, ") cũng cảm thấy vui vẻ (", { word: "fun" }, ") khi làm việc"] },
      { id: 'r8', part: 2, section: 1, content: ["Các bộ phim (", { word: "film" }, ") ngày xưa chỉ đen trắng (", { word: "white" }, ") vì ít ngân sách (", { word: "budget" }, "), nên số tiền (", { word: "money" }, ") đầu tư chỉ được 1 đô la (", { word: "dollars" }, ")"] },
      { id: 'r9', part: 2, section: 1, content: ["Vào thứ 7 (", { word: "saturday" }, ") 60 (", { word: "sixty" }, ") giải thưởng (", { word: "prize" }, ") bóng đá (", { word: "football" }, ") được trao tặng, còn tôi vẫn thấy đói (", { word: "hungry" }, ")"] },
      { id: 'r10', part: 3, section: 1, content: ["Mọi người (", { word: "people" }, ") mặc dù (", { word: "despite" }, ") lần đầu thấy (", { word: "first look" }, ") những đồ mắc tiền (", { word: "most expensive" }, "), nhưng họ vẫn chọn phô mai (", { word: "cheese" }, ")"] },
      { id: 'r11', part: 3, section: 1, content: ["Hai (", { word: "two" }, ") chủ đề (", { word: "topic" }, ") để nói về thành công trong công việc (", { word: "work" }, "), là chìa khóa (", { word: "key" }, ") và biết đặt câu hỏi (", { word: "ask questions" }, ")"] },
      { id: 'r12', part: 3, section: 1, content: ["Người giàu (", { word: "rich" }, ") hay phát minh (", { word: "invention" }, ") nhiều thứ, nhưng sau đó (", { word: "after" }, ") bởi vì (", { word: "because" }, ") sự tiện lợi (", { word: "convenient" }, ") nên không dùng đến chúng."] },
      { id: 'r13', part: 3, section: 1, content: ["Trước (", { word: "before" }, ") khi đi học (", { word: "education" }, "), anh ấy thích vẽ (", { word: "paint" }, ") cùng mọi người (", { word: "people" }, ") và đăng lên mạng xã hội (", { word: "social media" }, ")"] },
      { id: 'r14', part: 3, section: 1, content: ["Trước kia (", { word: "before" }, ") mọi người (", { word: "people" }, ") có ba (", { word: "three" }, ") hoặc chỉ hai (", { word: "two" }, ") căn nhà là nhiều (", { word: "many" }, ") rồi"] },
      { id: 'r15', part: 4, section: 1, topic: "Music Festival", prompt: "A: This is my first…", content: ["Lễ hội đầu tiên (", { word: "first" }, ") mà thời tiết (", { word: "weather" }, ") đẹp đến ngày cuối cùng (", { word: "final day" }, ")"] },
      { id: 'r16', part: 4, section: 1, topic: "Music Festival", prompt: "B: I attend music festivals every year…", content: ["Tham gia lễ hội (", { word: "attend music festivals" }, ") mà chả ấn tượng gì (", { word: "not impressed" }, ")"] },
      { id: 'r17', part: 4, section: 1, topic: "Music Festival", prompt: "C: I don’t like one particular kind of music …", content: ["Tôi không thích (", { word: "I don’t like" }, ") tất cả âm nhạc (", { word: "all the music" }, ") vì nó đắt (", { word: "expensive" }, ")"] },
      { id: 'r18', part: 4, section: 1, topic: "Music Festival", prompt: "D: My band and I went to the music festival …", content: ["Ban nhạc (", { word: "band" }, ") nhạc đều là những người bạn cũ (", { word: "old friends" }, ") của tôi, họ sống cùng một địa điểm (", { word: "location" }, ")"] },
      { id: 'r19', part: 4, section: 2, topic: "Career", prompt: "A: When I finished school …", content: ["Học xong (", { word: "finished school" }, ") thì tự do (", { word: "free" }, ")"] },
      { id: 'r20', part: 4, section: 2, topic: "Career", prompt: "B: I went straight to university …", content: ["Ở đại học (", { word: "University" }, ") thì thay đổi (", { word: "change" }, ") cách đào tạo (", { word: "training" }, ")"] },
      { id: 'r21', part: 4, section: 2, topic: "Career", prompt: "C: As a child …", content: ["Còn nhỏ (", { word: "as a child" }, ") thì tay (", { word: "hand" }, ") không quá dài (", { word: "long" }, ")"] },
      { id: 'r22', part: 4, section: 2, topic: "Career", prompt: "D: After school …", content: ["Khi ra trường (", { word: "after school" }, ") công việc đầu tiên (", { word: "first job" }, ") rất linh hoạt (", { word: "flexible" }, ")"] },
      { id: 'r22a', part: 4, section: 3, topic: "Extreme Sport", prompt: "A: I don’t usually like sports …", content: ["Tôi không thích (", { word: "I don’t usually like" }, ") buổi đào tạo (", { word: "training" }, ") đầu tiên (", { word: "first" }, ")"] },
      { id: 'r22b', part: 4, section: 3, topic: "Extreme Sport", prompt: "B: Some people like jumping out of aero planes", content: ["Một vài người thích (", { word: "some people like" }, ") truyền thống (", { word: "traditional" }, ") nhưng nó không cần thiết (", { word: "not necessary" }, ")"] },
      { id: 'r22c', part: 4, section: 3, topic: "Extreme Sport", prompt: "C: Doing free-diving requires", content: ["Lặn tự do (", { word: "doing free - diving" }, ") thường xuyên (", { word: "often" }, ") trong thiên nhiên (", { word: "nature" }, ")"] },
      { id: 'r22d', part: 4, section: 3, topic: "Extreme Sport", prompt: "D: As a child, I use to do sports", content: ["Khi còn bé (", { word: "as a child" }, "), tôi trốn tránh (", { word: "avoid" }, ") thể thao"] },
      { id: 'r22e', part: 4, section: 4, topic: "Childhood Activities", prompt: "A: As a child, I played board games …", content: ["Khi còn trẻ (", { word: "as a child" }, "), con của bọn họ (", { word: "their children" }, ") đều nghĩ đơn giản (", { word: "simple" }, ")"] },
      { id: 'r22f', part: 4, section: 4, topic: "Childhood Activities", prompt: "B: I preferred to play outdoor …", content: ["Tôi thích bên ngoài (", { word: "preferred outdoor" }, ") của những đứa trẻ con khác (", { word: "other children" }, ") hơn"] },
      { id: 'r22g', part: 4, section: 4, topic: "Childhood Activities", prompt: "C: I wasn’t able to move much …", content: ["Tôi không thể (", { word: "I wasn’t able to" }, ") đọc sách (", { word: "reading book" }, "), vì thích Games"] },
      { id: 'r22h', part: 4, section: 4, topic: "Childhood Activities", prompt: "D: I enjoyed playing outdoors …", content: ["Tôi thích chơi hoạt động ngoài trời (", { word: "I enjoyed playing outdoors" }, "), nhưng cũng ước (", { word: "wished" }, ") mình có thể giỏi nghệ thuật (", { word: "arts" }, ")"] },
      { id: 'r22i', part: 4, section: 5, topic: "Volunteering", prompt: "A: I understand many …", content: ["Hiểu (", { word: "understand" }, ") văn hóa (", { word: "culture" }, ") địa phương (", { word: "local" }, ")"] },
      { id: 'r22j', part: 4, section: 5, topic: "Volunteering", prompt: "B: My mother …", content: ["Mẹ (", { word: "mother" }, ") kết bạn (", { word: "make friends" }, ") thông qua công việc (", { word: "career" }, ")"] },
      { id: 'r22k', part: 4, section: 5, topic: "Volunteering", prompt: "C: I’m busy…", content: ["Bận (", { word: "busy" }, ") kiếm tiền (", { word: "money" }, ")"] },
      { id: 'r22l', part: 4, section: 5, topic: "Volunteering", prompt: "D: I don’t have…", content: ["Đi du lịch (", { word: "travel" }, ") không có (", { word: "don’t have" }, ") lợi ích (", { word: "benefits" }, ")"] },
      { id: 'r22m', part: 4, section: 6, topic: "Clean local park", prompt: "A: I adore spending time …", content: ["Tôi thích (", { word: "adore" }, ") đến những nơi đẹp (", { word: "beautiful" }, ") để xin giúp đỡ (", { word: "help" }, ")"] },
      { id: 'r22n', part: 4, section: 6, topic: "Clean local park", prompt: "B: I just don’t have …", content: ["Tôi chỉ (", { word: "I just" }, ") ước một cuộc sống bận rộn (", { word: "busy life" }, ") vì tương lai có việc (", { word: "future employment" }, ")"] },
      { id: 'r22o', part: 4, section: 6, topic: "Clean local park", prompt: "C: It is a good idea …", content: ["Nó là (", { word: "It is" }, ") khu vực (", { word: "areas" }, ") cần phải dọn dẹp thường xuyên (", { word: "regularly" }, ")"] },
      { id: 'r22p', part: 4, section: 6, topic: "Clean local park", prompt: "D: The park is of great importance …", content: ["Công viên (", { word: "the park" }, ") dành cho trẻ con (", { word: "children" }, ")"] },
      { id: 'r23', part: 5, section: 1, content: ["Cách sống (", { word: "way of life" }, ") mới dù không có lợi (", { word: "benefits" }, ") về tài chính (", { word: "financial" }, "), còn gặp những thách thức (", { word: "challenges" }, ") cũ (", { word: "old" }, "), người ta (", { word: "people" }, ") vẫn có giải pháp (", { word: "solutions" }, ")."] },
      { id: 'r24', part: 5, section: 1, content: ["Thay đổi (", { word: "changing" }, ") cảm nhận (", { word: "sense" }, "), công khai (", { word: "publicising" }, ") những việc sai (", { word: "wrong" }, "), và điều đáng lo ngại (", { word: "disturbing" }, ") là sự tập trung (", { word: "focus" }, ") vào mối quan hệ (", { word: "relationship" }, ")."] },
      { id: 'r25', part: 5, section: 1, content: ["Không rõ (", { word: "obscure" }, ") người tiên phong (", { word: "pioneer" }, ") là ai để ghi nhận (", { word: "credited" }, "), nên mất 1 thời gian dài (", { word: "long" }, ") để mọi người (", { word: "people" }, ") cân bằng (", { word: "balance" }, ") và đồng nhất (", { word: "uniformity" }, ")."] },
      { id: 'r26', part: 5, section: 1, content: ["Vào thời (", { word: "times" }, ") hiện đại (", { word: "modern" }, "), họ tiếp tục (", { word: "keeping" }, ") dùng mạng xã hội (", { word: "media" }, ") từ sớm (", { word: "early" }, ") là cố gắng (", { word: "trying" }, ") trong cuộc sống (", { word: "life" }, ")."] }
    ],
    Listening: [
      // --- PART 1 LISTENING (FULL 8 SECTIONS) ---
      // S1
      { id: 'l1', part: 1, section: 1, q: "How much is the **egg**?", t: "Quả trứng giá bao nhiêu?", a: "one pound fifty (1.5)" },
      { id: 'l2', part: 1, section: 1, q: "How much are the **cleaning products**?", t: "Sản phẩm vệ sinh giá bao nhiêu?", a: "one pound fifty (1.5)" },
      { id: 'l3', part: 1, section: 1, q: "Lalia **bus** cost", t: "Xe buýt Lalia giá bao nhiêu?", a: "£ 2.5" },
      { id: 'l4', part: 1, section: 1, q: "How much is the **laptop**?", t: "Máy tính xách tay giá bao nhiêu?", a: "£ 250" },
      { id: 'l5', part: 1, section: 1, q: "How much is the **small car**?", t: "Xe hơi nhỏ giá bao nhiêu?", a: "3250 pounds" },
      { id: 'l6', part: 1, section: 1, q: "How many clients are **Americans**?", t: "Có bao nhiêu khách hàng là người Mỹ?", a: "one" },
      { id: 'l7', part: 1, section: 1, q: "Which **platform** to wait for the train ( sân ga )", t: "Sân ga nào đợi tàu?", a: "two" },
      { id: 'l8', part: 1, section: 1, q: "Press number to buy **computer** ( máy tính )", t: "Nhấn số để mua máy tính?", a: "three" },
      { id: 'l9', part: 1, section: 1, q: "How many **seats** do they need?", t: "Họ cần bao nhiêu chỗ ngồi?", a: "20" },
      { id: 'l10', part: 1, section: 1, q: "How many **chairs** does the girl prepare?", t: "Cô gái chuẩn bị bao nhiêu ghế?", a: "20" },
      { id: 'l11', part: 1, section: 1, q: "Stephanie job. How **old** is she?", t: "Stephanie bao nhiêu tuổi?", a: "21" },
      { id: 'l12', part: 1, section: 1, q: "How many **new house** built?", t: "Bao nhiêu nhà mới được xây?", a: "2000" },
      { id: 'l13', part: 1, section: 1, q: "How many **people** live in the town?", t: "Bao nhiêu người sống trong thị trấn?", a: "10 000" },
      { id: 'l14', part: 1, section: 1, q: "Teleshop **telephone** ( sdt )", t: "SĐT Teleshop là gì?", a: "201030" },
      { id: 'l15', part: 1, section: 1, q: "Freeze frame **magazine** sold", t: "Tạp chí đã bán được bao nhiêu bản?", a: "over 300.000 copies" },
      // S2
      { id: 'l16', part: 1, section: 2, q: "Ahmed meet **Rose** at", t: "Ahmed gặp Rose lúc mấy giờ?", a: "a quarter to eight" },
      { id: 'l17', part: 1, section: 2, q: "See **Maria**. When will he see her?", t: "Khi nào gặp Maria?", a: "at 9 am on Sunday" },
      { id: 'l18', part: 1, section: 2, q: "When does the **train leave**?", t: "Khi nào tàu khởi hành?", a: "09:30" },
      { id: 'l19', part: 1, section: 2, q: "Samia meet friends, when?", t: "Samia gặp bạn bè khi nào?", a: "10:00" },
      { id: 'l20', part: 1, section: 2, q: "When the **meeting starts**?", t: "Khi nào cuộc họp bắt đầu?", a: "At 10:15" },
      { id: 'l21', part: 1, section: 2, q: "What time does the **football** start?", t: "Trận bóng đá lúc mấy giờ?", a: "1:00 PM" },
      { id: 'l22', part: 1, section: 2, q: "What time does they want to meet?", t: "Họ muốn gặp nhau lúc mấy giờ?", a: "2:00 PM" },
      { id: 'l23', part: 1, section: 2, q: "When does **she** want to meet?", t: "Cô ấy muốn gặp lúc nào?", a: "Three o'clock" },
      { id: 'l24', part: 1, section: 2, q: "Jorge and **Jose** meet?", t: "Jorge và Jose gặp nhau khi nào?", a: "6:30 PM" },
      { id: 'l25', part: 1, section: 2, q: "What time **he usually eats**?", t: "Anh ấy thường ăn lúc mấy giờ?", a: "Seven o'clock / 7:00 PM" },
      { id: 'l26', part: 1, section: 2, q: "he **talks**", t: "Anh ấy nói chuyện trong bao lâu?", a: "15 minutes" },
      { id: 'l27', part: 1, section: 2, q: "How long to **get to the station**?", t: "Đến ga mất bao lâu?", a: "20 minutes" },
      { id: 'l28', part: 1, section: 2, q: "How much did she spend **cycling**?", t: "Đạp xe bao lâu?", a: "35 minutes" },
      // S3
      { id: 'l29', part: 1, section: 3, q: "What time is the best for **children** to eat fruit?", t: "Lúc nào là tốt nhất cho trẻ em ăn trái cây?", a: "in the morning" },
      { id: 'l30', part: 1, section: 3, q: "When does she usually **write**?", t: "Khi cô ấy thường viết", a: "in the afternoon" },
      { id: 'l31', part: 1, section: 3, q: "**Two colleagues** talking about meeting", t: "Hai đồng nghiệp nói về buổi họp", a: "On Tuesday" },
      { id: 'l32', part: 1, section: 3, q: "When do the students **play football**?", t: "Khi nào sinh viên chơi bóng đá?", a: "Wednesday afternoon" },
      { id: 'l33', part: 1, section: 3, q: "When is the **meeting**?", t: "Khi nào có buổi họp?", a: "on Thursday morning" },
      { id: 'l34', part: 1, section: 3, q: "Doctor's office is calling to change the appointment. When is the **new appointment**?", t: "Phòng khám gọi điện để thay đổi lịch hẹn. Khi nào có lịch hẹn mới?", a: "On Thursday 13th" },
      { id: 'l35', part: 1, section: 3, q: "When will he need the **computer**?", t: "Khi nào anh ấy cần máy tính?", a: "Friday" },
      { id: 'l36', part: 1, section: 3, q: "When is the **work due**?", t: "Khi nào đến hạn nộp bài?", a: "Saturday morning" },
      { id: 'l37', part: 1, section: 3, q: "How long does Nate stay in **India**?", t: "Nate ở lại Ấn Độ bao lâu?", a: "2 weeks" },
      { id: 'l38', part: 1, section: 3, q: "How **old** is the **city**?", t: "Thành phố này bao nhiêu tuổi?", a: "1500 years" },
      // S4
      { id: 'l44', part: 1, section: 4, q: "What is the **dress** she wears like?", t: "Cô ấy mặc váy gì?", a: "Long and red" },
      { id: 'l45', part: 1, section: 4, q: "What **color is her dress**?", t: "Váy của cô ấy màu gì?", a: "Black" },
      { id: 'l46', part: 1, section: 4, q: "What **color top** is he going to **buy**?", t: "Anh ấy định mua áo màu gì?", a: "White" },
      { id: 'l47', part: 1, section: 4, q: "What color is the **teacher building**?", t: "Cô giáo đang xây nhà màu gì?", a: "White" },
      { id: 'l48', part: 1, section: 4, q: "What color is **Jack's house**?", t: "Nhà của Jack màu gì?", a: "Red" },
      { id: 'l49', part: 1, section: 4, q: "What does she do in her **free time**?", t: "Cô ấy làm gì vào thời gian rảnh?", a: "go to the theater and play sports" },
      { id: 'l50', part: 1, section: 4, q: "What can people **do in the afternoon**?", t: "Mọi người có thể làm gì vào buổi chiều?", a: "play golf" },
      { id: 'l51', part: 1, section: 4, q: "**How does the teacher go to school?**", t: "Cô giáo đi học như thế nào?", a: "She walks" },
      { id: 'l52', part: 1, section: 4, q: "What is the man going to do **after work**?", t: "Người đàn ông sẽ làm gì sau giờ làm việc?", a: "Goes Running" },
      { id: 'l53', part: 1, section: 4, q: "What is she **good at**?", t: "Cô ấy giỏi việc gì?", a: "Plays football" },
      { id: 'l54', part: 1, section: 4, q: "What does he do **after work**?", t: "Anh ấy làm gì sau giờ làm việc?", a: "Goes home" },
      { id: 'l55', part: 1, section: 4, q: "What does **Lily do** in the **evening**?", t: "Lily làm gì vào buổi tối?", a: "Goes for a walk" },
      { id: 'l56', part: 1, section: 4, q: "What does the family do most **weekend**?", t: "Gia đình thường làm gì vào cuối tuần?", a: "Goes for a walk" },
      { id: 'l57', part: 1, section: 4, q: "**What did the woman do on holiday?**", t: "Người phụ nữ đã làm gì vào kỳ nghỉ?", a: "Go to the park" },
      { id: 'l58', part: 1, section: 4, q: "Last year, the man enjoyed ...", t: "Năm ngoái, người đàn ông đã tận hưởng...", a: "cycling" },
      { id: 'l59', part: 1, section: 4, q: "What will she **do on holiday**?", t: "Cô ấy sẽ làm gì vào kỳ nghỉ?", a: "Go for a walk" },
      // S5 — Công việc & học tập / Quan hệ cá nhân / Giải trí & thường nhật
      { id: 'l170', part: 1, section: 5, q: "What does the **teacher** / **professor** ask his **student**?", t: "Giáo viên/giáo sư yêu cầu sinh viên của mình làm gì?", a: "Speak at a conference" },
      { id: 'l171', part: 1, section: 5, q: "Lack of **satisfaction** in work — what is the **solution**?", t: "Thiếu sự hài lòng trong công việc, giải pháp là gì?", a: "Request a transfer" },
      { id: 'l172', part: 1, section: 5, q: "She is an **artist** — what is the **difference** in her **job**?", t: "Cô ấy là một nghệ sĩ — sự khác biệt trong công việc của cô ấy là gì?", a: "She work irregular hours" },
      { id: 'l173', part: 1, section: 5, q: "What will the **father** do?", t: "Người cha sẽ làm gì?", a: "arrange private classes" },
      { id: 'l174', part: 1, section: 5, q: "A man talking about **jobs**", t: "Một người đàn ông đang nói về công việc", a: "work in business" },
      { id: 'l175', part: 1, section: 5, q: "He wants to **ask** for more **money**", t: "(Theo đề cương — ô x)", a: "Ask for more money" },
      { id: 'l176', part: 1, section: 5, q: "Anna calls her brother **Max**. What does **Anna** do?", t: "Anna gọi anh trai mình là Max. Anna làm gì?", a: "stay late at the office" },
      { id: 'l177', part: 1, section: 5, q: "Why does he need to learn to **drive**?", t: "Tại sao anh ấy cần học lái xe?", a: "He has to drive to work" },
      { id: 'l178', part: 1, section: 5, q: "**Advice** she gives to **save money**", t: "Lời khuyên cô ấy đưa ra để tiết kiệm tiền", a: "Cook for yourself" },
      { id: 'l179', part: 1, section: 5, q: "Why does **Vincent** call **James**?", t: "Tại sao Vincent lại gọi cho James?", a: "Suggest a drink" },
      { id: 'l180', part: 1, section: 5, q: "**Old manager** vs **George**", t: "Quản lý cũ và George", a: "he taught her a lot" },
      { id: 'l181', part: 1, section: 5, q: "What do **mother** and **daughter** have **in common**?", t: "Mẹ và con gái có điểm chung", a: "they have similar characters" },
      { id: 'l182', part: 1, section: 5, q: "**Douglas** calls **Kay** to …", t: "Douglas gọi Kay đến", a: "To say thank you" },
      { id: 'l183', part: 1, section: 5, q: "What do the **man** and **woman** decide to do in the **evening**?", t: "Người đàn ông và người phụ nữ quyết định làm gì vào buổi tối?", a: "Make plans later" },
      { id: 'l184', part: 1, section: 5, q: "Listen to **Mary** talking to **Jane** while waiting…. What did they **decide**?", t: "Hãy nghe Mary nói chuyện với Jane trong khi chờ đợi…. Họ đã quyết định làm gì?", a: "Have meeting without him" },
      { id: 'l185', part: 1, section: 5, q: "What is his **main problem**?", t: "Vấn đề chính của anh ấy là gì?", a: "Persuading his family" },
      { id: 'l186', part: 1, section: 5, q: "What does she usually do on **Saturdays**?", t: "Cô ấy thường làm gì vào thứ Bảy?", a: "seeing her family" },
      { id: 'l187', part: 1, section: 5, q: "**Birds** in the **winter**", t: "Những chú chim vào mùa đông", a: "Stay together for group protection" },
      { id: 'l188', part: 1, section: 5, q: "Why does she want to become a **writer** / **doctor**?", t: "Tại sao cô ấy muốn trở thành nhà văn/bác sĩ?", a: "to help people" },
      { id: 'l189', part: 1, section: 5, q: "What did she do **last weekend**?", t: "Cuối tuần trước cô ấy làm gì?", a: "stayed at home" },
      { id: 'l190', part: 1, section: 5, q: "What is the woman's favorite **form of entertainment**?", t: "Hình thức giải trí yêu thích của người phụ nữ là gì?", a: "Going to the theatre" },
      { id: 'l191', part: 1, section: 5, q: "Why does the **woman** get up **early**?", t: "Tại sao phụ nữ dậy sớm?", a: "have some quiet time" },
      { id: 'l192', part: 1, section: 5, q: "Outdoors **this afternoon**, you can ______", t: "Chiều nay ra ngoài trời, bạn có thể_______", a: "go on a city tour" },
      { id: 'l193', part: 1, section: 5, q: "What is the **woman** going to **do**?", t: "Người phụ nữ sẽ làm gì?", a: "Have coffee" },
      { id: 'l194', part: 1, section: 5, q: "What is the **teacher** preparing for the **meeting**?", t: "Giáo viên đang chuẩn bị gì cho buổi họp?", a: "order the food" },
      { id: 'l195', part: 1, section: 5, q: "What does the **actor** like to do in his **free time**?", t: "Nam diễn viên thích làm gì vào thời gian rảnh rỗi?", a: "drawing" },
      // S6 — tổng hợp từ đề (phần chung + địa điểm + bổ sung)
      { id: 'l200', part: 1, section: 6, q: "Pierre and Emma **bring**", t: "Pierre và Emma mang theo", a: "food" },
      { id: 'l201', part: 1, section: 6, q: "What does she have for **lunch**?", t: "Cô ấy ăn gì cho bữa trưa?", a: "Tea" },
      { id: 'l202', part: 1, section: 6, q: "What did she **lose**?", t: "Cô ấy đã mất gì?", a: "Phone" },
      { id: 'l203', part: 1, section: 6, q: "What **encouraged** her to become a **scientist**?", t: "Điều gì đã khuyến khích cô ấy trở thành một nhà khoa học?", a: "a large stone" },
      { id: 'l204', part: 1, section: 6, q: "What does the man **buy** in **shops**?", t: "Người đàn ông mua gì ở cửa hàng?", a: "A suit for the office/clothes" },
      { id: 'l205', part: 1, section: 6, q: "What did they **both** **buy**?", t: "Cả hai người đã mua gì?", a: "office/clothes" },
      { id: 'l206', part: 1, section: 6, q: "What did the man **lose**?", t: "Người đàn ông đã mất gì?", a: "Glasses" },
      { id: 'l207', part: 1, section: 6, q: "What does he **feed** the **cat**?", t: "Anh ta cho mèo ăn gì?", a: "Fish" },
      { id: 'l208', part: 1, section: 6, q: "What does the man want to **drink**?", t: "Người đàn ông muốn uống gì?", a: "Iced tea" },
      { id: 'l209', part: 1, section: 6, q: "What does the **brother** have to **drink**?", t: "Người anh trai muốn uống gì?", a: "water" },
      { id: 'l210', part: 1, section: 6, q: "Anne calls her daughter **Sally** — what does **Anne** **need**?", t: "Anne gọi con gái mình là Sally; Anne cần gì?", a: "eggs" },
      { id: 'l211', part: 1, section: 6, q: "What do you need to **buy** for his **sister**?", t: "Cần mua gì cho em gái mình?", a: "chocolates" },
      { id: 'l212', part: 1, section: 6, q: "What **feature** is not **original**?", t: "Tính năng nào không phải là bản gốc?", a: "furniture" },
      { id: 'l213', part: 1, section: 6, q: "The **course** a man **takes** this year", t: "Khóa học mà một người đàn ông học năm nay", a: "computer" },
      { id: 'l214', part: 1, section: 6, q: "What **new facility** will the **school** have?", t: "Trường sẽ có cơ sở vật chất mới nào?", a: "the performance space" },
      { id: 'l215', part: 1, section: 6, q: "What did she **buy**?", t: "Cô ấy đã mua gì?", a: "a dress" },
      { id: 'l216', part: 1, section: 6, q: "What are they going to **change**?", t: "Họ sẽ thay đổi những gì?", a: "windows" },
      { id: 'l217', part: 1, section: 6, q: "Anna is calling her **friend**. Where will they **meet**?", t: "Anna đang gọi cho bạn mình. Họ sẽ gặp nhau ở đâu?", a: "at the marketplace" },
      { id: 'l218', part: 1, section: 6, q: "Where is she going on **holidays**?", t: "Cô ấy sẽ đi nghỉ ở đâu?", a: "the mountains" },
      { id: 'l219', part: 1, section: 6, q: "What did she **like** about the **film**?", t: "Cô ấy thích gì ở bộ phim?", a: "The mountain scenes" },
      { id: 'l220', part: 1, section: 6, q: "Which **room** is the **class**?", t: "Lớp học ở phòng nào?", a: "Room 301" },
      { id: 'l221', part: 1, section: 6, q: "Where are they **standing**?", t: "Họ đang đứng ở đâu?", a: "university area" },
      { id: 'l222', part: 1, section: 6, q: "A student talking about **housing** — where does he **live** now?", t: "Một học sinh đang nói về nhà ở; hiện tại cậu ấy sống ở đâu?", a: "a town hall" },
      { id: 'l223', part: 1, section: 6, q: "Where does **Malik** want to **go**?", t: "Malik muốn đi đâu? (đáp án trống trong đề — tạm đặt)", a: "the sports centre" },
      { id: 'l224', part: 1, section: 6, q: "How did the **concert** **end**?", t: "Buổi hòa nhạc kết thúc như thế nào?", a: "The city 's favorite group" },
      { id: 'l225', part: 1, section: 6, q: "What is **Soobin**'s favorite **room**?", t: "Phòng yêu thích của Soobin là gì?", a: "bathroom" },
      { id: 'l226', part: 1, section: 6, q: "The **football club** **near** — what is **near** it?", t: "Câu lạc bộ bóng đá gần đó", a: "A park" },
      { id: 'l227', part: 1, section: 6, q: "Where will the **group** wait for the **bus**?", t: "Cả nhóm sẽ đợi xe buýt ở đâu?", a: "by the hotel's main entrance" },
      { id: 'l228', part: 1, section: 6, q: "The girl meets her **dad**. Where did she **meet** him?", t: "Cô bé gặp bố mình. Cô bé gặp bố ở đâu?", a: "Front entrance" },
      { id: 'l229', part: 1, section: 6, q: "What is the **largest** **room**?", t: "Phòng lớn nhất là phòng nào?", a: "the kitchen" },
      { id: 'l230', part: 1, section: 6, q: "Where does **Anna** go for a **walk** every **morning**?", t: "Anna thường đi dạo ở đâu mỗi sáng?", a: "college" },
      { id: 'l231', part: 1, section: 6, q: "What was his **favorite** about **school**?", t: "Điều gì ở trường khiến anh ấy thích nhất?", a: "History classes" },
      { id: 'l232', part: 1, section: 6, q: "What does he **like** to **study**?", t: "Anh ấy thích học.", a: "art" },
      { id: 'l233', part: 1, section: 6, q: "What does the man's **wife** **enjoy**?", t: "Vợ của anh ấy thích gì?", a: "photography" },
      { id: 'l234', part: 1, section: 6, q: "What did the **family** do **last year**?", t: "Năm ngoái gia đình anh ấy đã làm gì?", a: "Camping" },
      { id: 'l235', part: 1, section: 6, q: "Which **country** does the **class** study this **term**?", t: "Học kỳ này lớp học ở nước nào?", a: "France" },
      { id: 'l236', part: 1, section: 6, q: "What is the **main cause** of poor **air quality**?", t: "(Không có câu tiếng Việt trong đề)", a: "Fires in the countryside" },
      { id: 'l237', part: 1, section: 6, q: "Why was **air travel** **canceled**?", t: "(Không có câu tiếng Việt trong đề)", a: "poor weather conditions" },
      { id: 'l238', part: 1, section: 6, q: "What **aspect** of the **song** attracts **attention**?", t: "(Không có câu tiếng Việt trong đề)", a: "the word" },
      { id: 'l239', part: 1, section: 6, q: "What **aspect** do they **both** **agree** on?", t: "(Không có câu tiếng Việt trong đề)", a: "the ending" },
      { id: 'l240', part: 1, section: 6, q: "**Mother** and **daughter** — what do they have **in common**?", t: "Mẹ và con gái có điểm chung (đề không có câu Việt)", a: "They have similar characters" },
      { id: 'l241', part: 1, section: 6, q: "A woman on the **radio** talking about a **film**. What film did she **recommend**?", t: "Người phụ nữ trên radio đang nói về phim. Cô ấy đã giới thiệu phim gì?", a: "an action film" },
      // S7 — Cụm tính từ / Giới từ
      { id: 'l300', part: 1, section: 7, q: "How does **Even** **feel**?", t: "Even cảm thấy thế nào?", a: "Sick" },
      { id: 'l301', part: 1, section: 7, q: "In what way are the **mother** and the **aunt** **alike**?", t: "Mẹ và dì giống nhau ở điểm nào?", a: "They were thin" },
      { id: 'l302', part: 1, section: 7, q: "He **prefers** traveling by **train**", t: "Anh ấy thích đi tàu hơn", a: "Practical" },
      { id: 'l303', part: 1, section: 7, q: "What do they think the **weather** will **be like**?", t: "Họ nghĩ thời tiết sẽ như thế nào?", a: "cold and wet" },
      { id: 'l304', part: 1, section: 7, q: "What does **Jana's sister** look **like**?", t: "Em gái của Jana trông như thế nào?", a: "short" },
      { id: 'l305', part: 1, section: 7, q: "Where is the **main office**?", t: "Văn phòng chính ở đâu?", a: "on the first floor" },
      { id: 'l306', part: 1, section: 7, q: "Where are they going to **meet**?", t: "Họ sẽ gặp nhau ở đâu?", a: "at the park" },
      { id: 'l307', part: 1, section: 7, q: "Where is she going to **do shopping**?", t: "Cô ấy sẽ mua sắm ở đâu?", a: "at a new shopping centre" },
      { id: 'l308', part: 1, section: 7, q: "How is he going to **travel** to the **city**?", t: "Anh ấy sẽ đi vào thành phố bằng cách nào?", a: "by train" },
      { id: 'l309', part: 1, section: 7, q: "How does **Greg** go to **work**?", t: "Greg đi làm bằng cách nào?", a: "by bus" },
      // S8
      { id: 'l310', part: 1, section: 8, q: "What will she **do** …?", t: "Cô ấy sẽ làm gì…", a: "the south" },
      { id: 'l311', part: 1, section: 8, q: "Where is the **Coffee shop** **located**?", t: "Quán cà phê ở đâu?", a: "opposite the gift shop" },
      { id: 'l312', part: 1, section: 8, q: "Husband and wife meet / where will they **meet**?", t: "Vợ chồng gặp nhau / họ sẽ gặp nhau ở đâu?", a: "outside the shop" },
      { id: 'l313', part: 1, section: 8, q: "**Luis** meets **Standard**", t: "Luis gặp Standard.", a: "Outside the station" },
      { id: 'l314', part: 1, section: 8, q: "Where is the **office** **located** …?", t: "Văn phòng ở đâu…", a: "Opposite the hotel" },
      { id: 'l315', part: 1, section: 8, q: "Where will the **weather** be **best**?", t: "Thời tiết ở đâu sẽ đẹp nhất?", a: "In the east" },
      { id: 'l316', part: 1, section: 8, q: "The girl forgot something in the **cafe** — where did she put it?", t: "Cô gái quên đồ trong quán cà phê; cô ấy gọi nhân viên hỏi đã bỏ đồ vào đâu?", a: "in the corner" },
      { id: 'l317', part: 1, section: 8, q: "Who is visiting **Tom** this **weekend**?", t: "Ai sẽ đến thăm Tom vào cuối tuần này?", a: "His sister and children" },
      { id: 'l318', part: 1, section: 8, q: "Why was the **tour** **canceled**?", t: "Tại sao chuyến tham quan bị hủy?", a: "Not enough people" },
      { id: 'l319', part: 1, section: 8, q: "What is the **first job** of the **writer**?", t: "Công việc đầu tiên của người viết là gì?", a: "Teacher" },
      { id: 'l320', part: 1, section: 8, q: "She is talking about the **photo** of …", t: "Cô ấy đang nói về bức ảnh", a: "the girl's team" },
      { id: 'l321', part: 1, section: 8, q: "What is the **relationship** between the **speaker** and **Lisa**?", t: "Mối quan hệ giữa người nói và Lisa là gì?", a: "best friends" },
      { id: 'l322', part: 1, section: 8, q: "What does the **man** want to do **next**?", t: "Người đàn ông muốn làm gì tiếp theo?", a: "A writer" },
      { id: 'l323', part: 1, section: 8, q: "Why does he **like** **Dubai**?", t: "Tại sao anh ấy thích Dubai?", a: "He enjoys the job here" },
      { id: 'l324', part: 1, section: 8, q: "**Mary** talks with her **friends** about …?", t: "Mary nói chuyện với bạn bè về…?", a: "where to buy a new table" },
      { id: 'l325', part: 1, section: 8, q: "Where will **tea** be **served**?", t: "Trà sẽ được phục vụ ở đâu?", a: "on the River Boat" },
      { id: 'l326', part: 1, section: 8, q: "Which part of the **cabinet** is **original**?", t: "Phần nào của tủ là nguyên bản?", a: "drawer" },

      // --- PART 2 LISTENING ---
      { id: 'lp2-1', part: 2, section: 1, isStatic: true, q: "Tham khảo đề cương", t: "Phần này không có bài tập kéo thả", a: "Không có đáp án chỉ tham khảo ở đề cương" },

      // --- PART 3 LISTENING (12 sections: hàng 1 Community→Art→Beauty→Internet; hàng 2 Uni→Politics→Tech→Workplace; hàng 3 Urban→Singer→Audition→Local) ---
      {
        id: 'lp3-m', part: 3, section: 1, type: 'matching_dropdown', topicColor: 'indigo',
        topic: 'Community', opener: 'Man mở lời', mnemonic: 'Bố Will Muốn Ban ấy xây dựng cộng đồng', acronym: 'BWMB',
        mnemonicNote: 'Woman mở lời: BMWB — Bà Mong Will Biết xây dựng cộng đồng',
        statements: [
          { id: 'st-m-1', text: 'Community design influence people **behavior**', speaker: 'Both' },
          { id: 'st-m-2', text: 'Sense of community **takes time**', speaker: 'Woman' },
          { id: 'st-m-3', text: 'Work community and social community are the same', speaker: 'Man' },
          { id: 'st-m-4', text: '**Technology** improve the way community formed', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-w', part: 3, section: 1, type: 'matching_dropdown', topicColor: 'indigo',
        topic: 'Community', opener: 'Woman mở lời', mnemonic: 'Bà Mong Will Biết xây dựng cộng đồng', acronym: 'BMWB',
        mnemonicNote: 'Man mở lời: BWMB — Bố Will Muốn Ban ấy xây dựng cộng đồng',
        statements: [
          { id: 'st-w-1', text: 'Community design influence people **behavior**', speaker: 'Both' },
          { id: 'st-w-2', text: 'Work community and social community are the same', speaker: 'Man' },
          { id: 'st-w-3', text: 'Sense of community **takes time**', speaker: 'Woman' },
          { id: 'st-w-4', text: '**Technology** improve the way community formed', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-art-m', part: 3, section: 2, type: 'matching_dropdown', topicColor: 'amber',
        topic: 'Art', opener: 'Man đọc trước', mnemonic: 'Will muốn bố mẹ cho phép học nghệ thuật', acronym: 'WMBM',
        mnemonicNote: 'Woman đọc trước: MWBW — mẹ Will bảo Will đi học nghệ thuật',
        statements: [
          { id: 'lp3-artm-1', text: 'Arts are only **for few privileged**', speaker: 'Woman' },
          { id: 'lp3-artm-2', text: 'Governments should **invest** more in arts', speaker: 'Man' },
          { id: 'lp3-artm-3', text: '**Children** should get involved in arts early', speaker: 'Both' },
          { id: 'lp3-artm-4', text: 'In the **future**, arts will be more accessible', speaker: 'Man' }
        ]
      },
      {
        id: 'lp3-art-w', part: 3, section: 2, type: 'matching_dropdown', topicColor: 'amber',
        topic: 'Art', opener: 'Woman đọc trước', mnemonic: 'Mẹ Will bảo Will đi học nghệ thuật', acronym: 'MWBW',
        mnemonicNote: 'Man đọc trước: WMBM — Will muốn bố mẹ cho phép học nghệ thuật',
        statements: [
          { id: 'lp3-artw-1', text: 'Arts are only **for few privileged**', speaker: 'Man' },
          { id: 'lp3-artw-2', text: 'Governments should **invest** more in arts', speaker: 'Woman' },
          { id: 'lp3-artw-3', text: '**Children** should get involved in arts early', speaker: 'Both' },
          { id: 'lp3-artw-4', text: 'In the **future**, arts will be more accessible', speaker: 'Woman' }
        ]
      },
      {
        id: 'lp3-beauty-m', part: 3, section: 3, type: 'matching_dropdown', topicColor: 'fuchsia',
        topic: 'Beauty', opener: 'Man đọc trước', mnemonic: 'Win Muốn Bố Mẹ trẻ đẹp', acronym: 'WMBM',
        mnemonicNote: 'Woman đọc trước: MWBW',
        statements: [
          { id: 'lp3-beautym-1', text: 'People share **similar** ideas about beauty', speaker: 'Woman' },
          { id: 'lp3-beautym-2', text: 'Ideas about beauty change **over time**', speaker: 'Man' },
          { id: 'lp3-beautym-3', text: 'Beauty can be found in **unlikely** places', speaker: 'Both' },
          { id: 'lp3-beautym-4', text: '**Traditional** ideas about beauty are going to change', speaker: 'Man' }
        ]
      },
      {
        id: 'lp3-beauty-w', part: 3, section: 3, type: 'matching_dropdown', topicColor: 'fuchsia',
        topic: 'Beauty', opener: 'Woman đọc trước', mnemonic: 'Woman đọc trước — MWBW', acronym: 'MWBW',
        mnemonicNote: 'Man đọc trước: WMBM — Win Muốn Bố Mẹ trẻ đẹp',
        statements: [
          { id: 'lp3-beautyw-1', text: 'People share **similar** ideas about beauty', speaker: 'Man' },
          { id: 'lp3-beautyw-2', text: 'Ideas about beauty change **over time**', speaker: 'Woman' },
          { id: 'lp3-beautyw-3', text: 'Beauty can be found in **unlikely** places', speaker: 'Both' },
          { id: 'lp3-beautyw-4', text: '**Traditional** ideas about beauty are going to change', speaker: 'Woman' }
        ]
      },
      {
        id: 'lp3-internet', part: 3, section: 4, type: 'matching_dropdown', topicColor: 'sky',
        topic: 'Internet',
        opener: 'Nam nói trước',
        mnemonic: 'Will Bảo Mẹ Biết dùng internet',
        mnemonicNote: 'Woman nói trước: MBWB — Mẹ biết Will bận dùng Internet',
        acronym: 'WBMB',
        statements: [
          { id: 'lp3-net-1', text: 'There is **too much information** on the Internet', speaker: 'Woman' },
          { id: 'lp3-net-2', text: 'Finding information on the Internet requires **skills**', speaker: 'Both' },
          { id: 'lp3-net-3', text: 'The **use** of the internet affects **the way we think**', speaker: 'Man' },
          { id: 'lp3-net-4', text: 'The internet makes young people **less patient**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-internet-w', part: 3, section: 4, type: 'matching_dropdown', topicColor: 'sky',
        topic: 'Internet',
        opener: 'Nữ mở lời',
        mnemonic: 'Mẹ biết Will bận dùng Internet',
        mnemonicNote: 'Nam nói trước: WBMB — Will Bảo Mẹ Biết dùng internet',
        acronym: 'MBWB',
        statements: [
          { id: 'lp3-netw-1', text: 'There is **too much information** on the Internet', speaker: 'Man' },
          { id: 'lp3-netw-2', text: 'Finding information on the Internet requires **skills**', speaker: 'Both' },
          { id: 'lp3-netw-3', text: 'The **use** of the internet affects **the way we think**', speaker: 'Woman' },
          { id: 'lp3-netw-4', text: 'The internet makes young people **less patient**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-uni', part: 3, section: 5, type: 'matching_dropdown', topicColor: 'emerald',
        topic: 'Universities',
        opener: 'Man mở lời',
        mnemonic: 'Bố Will mắng Will vì trượt đại học',
        mnemonicNote: 'Woman nói trước: BMWM — Bố Mẹ Will Muốn học Đại Học',
        acronym: 'BMWM',
        statements: [
          { id: 'lp3-uni-1', text: 'The **internet** makes education more accessible', speaker: 'Both' },
          { id: 'lp3-uni-2', text: '**Social interactions** are essential to university life', speaker: 'Woman' },
          { id: 'lp3-uni-3', text: '**Diverse curriculum** is not always a good thing', speaker: 'Man' },
          { id: 'lp3-uni-4', text: '**Competitions** between universities should be encouraged', speaker: 'Woman' }
        ]
      },
      {
        id: 'lp3-uni-w', part: 3, section: 5, type: 'matching_dropdown', topicColor: 'emerald',
        topic: 'Universities',
        opener: 'Woman mở lời',
        mnemonic: 'Bố Mẹ Will Muốn học Đại Học',
        mnemonicNote: 'Man mở lời: BMWM — Bố Will mắng Will vì trượt đại học',
        acronym: 'BMWM',
        statements: [
          { id: 'lp3-uniw-1', text: 'The **internet** makes education more accessible', speaker: 'Both' },
          { id: 'lp3-uniw-2', text: '**Social interactions** are essential to university life', speaker: 'Man' },
          { id: 'lp3-uniw-3', text: '**Diverse curriculum** is not always a good thing', speaker: 'Woman' },
          { id: 'lp3-uniw-4', text: '**Competitions** between universities should be encouraged', speaker: 'Man' }
        ]
      },
      {
        id: 'lp3-pol', part: 3, section: 6, type: 'matching_dropdown', topicColor: 'rose',
        topic: 'Politics',
        opener: 'Giọng nam đọc trước',
        mnemonic: 'Bố Mẹ Will Bắt học chính trị',
        mnemonicNote: 'Woman nói trước: BWMB — Bố và (W) mẹ bàn về chính trị',
        acronym: 'BWMB',
        statements: [
          { id: 'lp3-pol-1', text: '**Young people** are more into politics', speaker: 'Both' },
          { id: 'lp3-pol-2', text: '**Social media** changes politics', speaker: 'Woman' },
          { id: 'lp3-pol-3', text: 'People are now **better informed** on politics', speaker: 'Man' },
          { id: 'lp3-pol-4', text: 'More **women** pursue politics', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-pol-w', part: 3, section: 6, type: 'matching_dropdown', topicColor: 'rose',
        topic: 'Politics',
        opener: 'Giọng nữ đọc trước',
        mnemonic: 'Bố và (W) mẹ bàn về chính trị',
        mnemonicNote: 'Giọng nam: BWMB — Bố Mẹ Will Bắt học chính trị',
        acronym: 'BWMB',
        statements: [
          { id: 'lp3-polw-1', text: '**Young people** are more into politics', speaker: 'Both' },
          { id: 'lp3-polw-2', text: '**Social media** changes politics', speaker: 'Man' },
          { id: 'lp3-polw-3', text: 'People are now **better informed** on politics', speaker: 'Woman' },
          { id: 'lp3-polw-4', text: 'More **women** pursue politics', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-tech', part: 3, section: 7, type: 'matching_dropdown', topicColor: 'violet',
        topic: 'Information and Technology',
        opener: 'Giọng nam trước',
        mnemonic: 'Mẹ 2 Win Bắt học công nghệ',
        mnemonicNote: 'Giọng nữ trước: WMMB — Will Mong Muốn Biết về công nghệ',
        acronym: 'WMMB',
        statements: [
          { id: 'lp3-tech-1', text: 'The **future generation** fails to cope with technology information', speaker: 'Man' },
          { id: 'lp3-tech-2', text: 'The technology revolution is good for the **economy**', speaker: 'Woman' },
          { id: 'lp3-tech-3', text: 'No computer is superior to the **human brain**', speaker: 'Woman' },
          { id: 'lp3-tech-4', text: 'More should be done to **protect individual privacy**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-tech-w', part: 3, section: 7, type: 'matching_dropdown', topicColor: 'violet',
        topic: 'Information and Technology',
        opener: 'Giọng nữ trước',
        mnemonic: 'Will Mong Muốn Biết về công nghệ',
        mnemonicNote: 'Giọng nam: WMMB — Mẹ 2 Win Bắt học công nghệ',
        acronym: 'WMMB',
        statements: [
          { id: 'lp3-techw-1', text: 'The **future generation** fails to cope with technology information', speaker: 'Woman' },
          { id: 'lp3-techw-2', text: 'The technology revolution is good for the **economy**', speaker: 'Man' },
          { id: 'lp3-techw-3', text: 'No computer is superior to the **human brain**', speaker: 'Man' },
          { id: 'lp3-techw-4', text: 'More should be done to **protect individual privacy**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-work-m', part: 3, section: 8, type: 'matching_dropdown', topicColor: 'teal',
        topic: 'Changes in workplace',
        opener: 'Man mở đầu',
        mnemonic: 'Mẹ Will Bảo Muốn đổi nơi làm việc',
        mnemonicNote: 'Woman mở lời: WMBW — Will Muốn Bố Viết về thay đổi công việc',
        acronym: 'MWBM',
        statements: [
          { id: 'lp3-work-m1', text: '**Continuity** is important', speaker: 'Man' },
          { id: 'lp3-work-m2', text: 'Job security **can\'t** be guaranteed', speaker: 'Woman' },
          { id: 'lp3-work-m3', text: 'Job **satisfaction** is an important motivator', speaker: 'Both' },
          { id: 'lp3-work-m4', text: '**Technology** is good for the economy', speaker: 'Man' }
        ]
      },
      {
        id: 'lp3-work-w', part: 3, section: 8, type: 'matching_dropdown', topicColor: 'teal',
        topic: 'Changes in workplace',
        opener: 'Woman mở lời',
        mnemonic: 'Will Muốn Bố Viết về thay đổi công việc',
        mnemonicNote: 'Man mở đầu: MWBM — Mẹ Will Bảo Muốn đổi nơi làm việc',
        acronym: 'WMBW',
        statements: [
          { id: 'lp3-work-w1', text: '**Continuity** is important', speaker: 'Woman' },
          { id: 'lp3-work-w2', text: 'Job security **can\'t** be guaranteed', speaker: 'Man' },
          { id: 'lp3-work-w3', text: 'Job **satisfaction** is an important motivator', speaker: 'Both' },
          { id: 'lp3-work-w4', text: '**Technology** is good for the economy', speaker: 'Woman' }
        ]
      },
      {
        id: 'lp3-farm-m', part: 3, section: 9, type: 'matching_dropdown', topicColor: 'cyan',
        topic: 'Urban farming',
        opener: 'Giọng nam đọc trước',
        mnemonic: 'Will Muốn Mẹ Bỏ làm nghề nông',
        mnemonicNote: 'Giọng nữ đọc trước: MWWB — Mẹ Will và Will Biết làm nghề nông',
        acronym: 'WMMB',
        statements: [
          { id: 'lp3-farm-m1', text: '**Living space** is more important than farming space', speaker: 'Woman' },
          { id: 'lp3-farm-m2', text: '**Farming space** is appealing', speaker: 'Man' },
          { id: 'lp3-farm-m3', text: 'Farming space will benefit the urban **economy**', speaker: 'Man' },
          { id: 'lp3-farm-m4', text: 'Farming space is **in need of more food**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-farm-w', part: 3, section: 9, type: 'matching_dropdown', topicColor: 'cyan',
        topic: 'Urban farming',
        opener: 'Giọng nữ đọc trước',
        mnemonic: 'Mẹ Will và Will Biết làm nghề nông',
        mnemonicNote: 'Giọng nam trước: WMMB — Will Muốn Mẹ Bỏ làm nghề nông',
        acronym: 'MWWB',
        statements: [
          { id: 'lp3-farm-w1', text: '**Living space** is more important than farming space', speaker: 'Man' },
          { id: 'lp3-farm-w2', text: '**Farming space** is appealing', speaker: 'Woman' },
          { id: 'lp3-farm-w3', text: 'Farming space will benefit the urban **economy**', speaker: 'Woman' },
          { id: 'lp3-farm-w4', text: 'Farming space is **in need of more food**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-music-m', part: 3, section: 10, type: 'matching_dropdown', topicColor: 'orange',
        topic: 'Singer and music',
        opener: 'Man đọc trước',
        mnemonic: 'Will Biết Mẹ Bận làm ca sĩ',
        mnemonicNote: 'Woman nói trước: MBWB — Mẹ Bảo Win Bố đang làm ca sĩ',
        acronym: 'WBMB',
        statements: [
          { id: 'lp3-music-m1', text: 'A **singer** can be good **models** for the young', speaker: 'Woman' },
          { id: 'lp3-music-m2', text: '**Taste** in music is a highly **personal** thing', speaker: 'Both' },
          { id: 'lp3-music-m3', text: 'Music is a **universal language**', speaker: 'Man' },
          { id: 'lp3-music-m4', text: 'Music can be used to manipulate people\'s **feelings**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-music-w', part: 3, section: 10, type: 'matching_dropdown', topicColor: 'orange',
        topic: 'Singer and music',
        opener: 'Woman nói trước',
        mnemonic: 'Mẹ Bảo Win Bố đang làm ca sĩ',
        mnemonicNote: 'Man đọc trước: WBMB — Will Biết Mẹ Bận làm ca sĩ',
        acronym: 'MBWB',
        statements: [
          { id: 'lp3-music-w1', text: 'A **singer** can be good **models** for the young', speaker: 'Man' },
          { id: 'lp3-music-w2', text: '**Taste** in music is a highly **personal** thing', speaker: 'Both' },
          { id: 'lp3-music-w3', text: 'Music is a **universal language**', speaker: 'Woman' },
          { id: 'lp3-music-w4', text: 'Music can be used to manipulate people\'s **feelings**', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-audit-m', part: 3, section: 11, type: 'matching_dropdown', topicColor: 'pink',
        topic: 'Audition',
        opener: 'Man mở lời',
        mnemonic: 'Mẹ Will Bảo Bố thử giọng hát',
        mnemonicNote: 'Nếu woman mở lời: WMBB',
        acronym: 'MWBB',
        statements: [
          { id: 'lp3-audit-m1', text: 'Auditions are most **important**', speaker: 'Man' },
          { id: 'lp3-audit-m2', text: 'Actors respond best to **strong scripts**', speaker: 'Woman' },
          { id: 'lp3-audit-m3', text: 'Theater acting and screen acting are **different**', speaker: 'Both' },
          { id: 'lp3-audit-m4', text: 'Actors should be **praised** as much as possible', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-audit-w', part: 3, section: 11, type: 'matching_dropdown', topicColor: 'pink',
        topic: 'Audition',
        opener: 'Woman mở lời',
        mnemonic: 'WMBB — woman trước',
        mnemonicNote: 'Man mở lời: MWBB — Mẹ Will Bảo Bố thử giọng hát',
        acronym: 'WMBB',
        statements: [
          { id: 'lp3-audit-w1', text: 'Auditions are most **important**', speaker: 'Woman' },
          { id: 'lp3-audit-w2', text: 'Actors respond best to **strong scripts**', speaker: 'Man' },
          { id: 'lp3-audit-w3', text: 'Theater acting and screen acting are **different**', speaker: 'Both' },
          { id: 'lp3-audit-w4', text: 'Actors should be **praised** as much as possible', speaker: 'Both' }
        ]
      },
      {
        id: 'lp3-local-m', part: 3, section: 12, type: 'matching_dropdown', topicColor: 'lime',
        topic: 'Local cultural center',
        opener: 'Man nói trước',
        mnemonic: 'Win Bảo Mẹ Mang văn hoá địa phương',
        mnemonicNote: 'Woman: MBWW — Mẹ Bảo Win Viết về văn hoá địa phương',
        acronym: 'WBMM',
        statements: [
          { id: 'lp3-local-m1', text: 'The **exhibition** should be different', speaker: 'Woman' },
          { id: 'lp3-local-m2', text: 'The **traditions** are losing significance', speaker: 'Both' },
          { id: 'lp3-local-m3', text: 'The **local festival** will disappear soon', speaker: 'Man' },
          { id: 'lp3-local-m4', text: 'Schools are **important**', speaker: 'Man' }
        ]
      },
      {
        id: 'lp3-local-w', part: 3, section: 12, type: 'matching_dropdown', topicColor: 'lime',
        topic: 'Local cultural center',
        opener: 'Woman nói trước',
        mnemonic: 'Mẹ Bảo Win Viết về văn hoá địa phương',
        mnemonicNote: 'Man nói trước: WBMM — Win Bảo Mẹ Mang văn hoá địa phương',
        acronym: 'MBWW',
        statements: [
          { id: 'lp3-local-w1', text: 'The **exhibition** should be different', speaker: 'Man' },
          { id: 'lp3-local-w2', text: 'The **traditions** are losing significance', speaker: 'Both' },
          { id: 'lp3-local-w3', text: 'The **local festival** will disappear soon', speaker: 'Woman' },
          { id: 'lp3-local-w4', text: 'Schools are **important**', speaker: 'Woman' }
        ]
      },

      // --- PART 4 LISTENING — điền chỗ trống (từ trong ngoặc → kho bên phải); mỗi section: chủ đề + câu ---
      {
        id: 'lp4-1',
        part: 4,
        section: 1,
        topic: 'making plans — Set up goals',
        content: [
          'Lập mục tiêu ',
          { word: 'set up goals' },
          ' thì cần linh hoạt ',
          { word: 'flexible' },
          ' và có giới hạn ',
          { word: 'limits' },
          '.'
        ]
      },
      {
        id: 'lp4-2',
        part: 4,
        section: 2,
        topic: 'Writers',
        content: [
          'Nhà văn ',
          { word: 'writers' },
          ' trong xã hội hiện đại ',
          { word: 'modern society' },
          ' rất khó để tìm ra ',
          { word: 'identify' },
          '.'
        ]
      },
      {
        id: 'lp4-3',
        part: 4,
        section: 3,
        topic: 'Promotion campaign for a product',
        content: [
          'Quảng cáo ',
          { word: 'promotion' },
          ' bị phóng đại ',
          { word: 'exaggerated' },
          ', không đúng với công dụng hiện có của sản phẩm ',
          { word: 'products' },
          '.'
        ]
      },
      {
        id: 'lp4-4',
        part: 4,
        section: 4,
        topic: 'Advertising',
        content: [
          'Quảng cáo ',
          { word: 'advertising' },
          ' về sản phẩm mới ',
          { word: 'new' },
          ' thường không tốt cho fans ',
          { word: 'not good for fans' },
          '.'
        ]
      },
      {
        id: 'lp4-5',
        part: 4,
        section: 5,
        topic: 'sport competition in school',
        content: [
          'Thể thao tại trường ',
          { word: 'sport in schools' },
          ' có thể gây ảnh hưởng có hại ',
          { word: 'harmful effects' },
          ' tới sự cân bằng ',
          { word: 'balance' },
          ' học tập.'
        ]
      },
      {
        id: 'lp4-6',
        part: 4,
        section: 6,
        topic: 'Regional Development Planning',
        content: [
          'Phát triển vùng ',
          { word: 'regional development' },
          ' bằng cách cấm lái ô tô ',
          { word: 'driving' },
          ' thì khó gặp ',
          { word: 'meet' },
          ' bạn.'
        ]
      },
      {
        id: 'lp4-7',
        part: 4,
        section: 7,
        topic: '16. Personal finances',
        content: [
          'Tài chính cá nhân ',
          { word: 'personal finances' },
          ' để có nhiều tài nguyên ',
          { word: 'resources' },
          ' thì cần xin lời khuyên ',
          { word: 'get advice' },
          '.'
        ]
      },
      {
        id: 'lp4-8',
        part: 4,
        section: 8,
        topic: "A writer's new novel",
        content: [
          'Tiểu thuyết mới ',
          { word: 'new novel' },
          ' khác biệt ',
          { word: 'different' },
          ' nên bị nhận nhiều chỉ trích ',
          { word: 'critics' },
          '.'
        ]
      },
      {
        id: 'lp4-9',
        part: 4,
        section: 9,
        topic: "Writer's block",
        content: [
          'Viết văn ',
          { word: 'writers' },
          ' theo chu kì ',
          { word: 'period' },
          ' là lời khuyên ',
          { word: 'advice' },
          ' tốt.'
        ]
      },
      {
        id: 'lp4-10',
        part: 4,
        section: 10,
        topic: 'New series',
        content: [
          'New series thì làm hội thoại ',
          { word: 'dialogues' },
          ' theo kịch bản ',
          { word: 'script' },
          '.'
        ]
      },
      {
        id: 'lp4-11',
        part: 4,
        section: 11,
        topic: 'Professionalism',
        content: [
          'Sự chuyên nghiệp ',
          { word: 'professionalism' },
          ' thể hiện qua thái độ tích cực ',
          { word: 'positive attitude' },
          ' và sự thay đổi ',
          { word: 'changing' },
          ' liên tục.'
        ]
      },
      {
        id: 'lp4-12',
        part: 4,
        section: 12,
        topic: 'Life after university',
        content: [
          'Cuộc sống sau đại học ',
          { word: 'life after university' },
          ' thì linh động ',
          { word: 'flexible' },
          ' nhưng cạnh tranh ',
          { word: 'competitive' },
          '.'
        ]
      },
      {
        id: 'lp4-13',
        part: 4,
        section: 13,
        topic: 'The life of scientist',
        content: [
          'Cuộc sống của một nhà khoa học ',
          { word: 'life of a scientist' },
          ' thì thú vị ',
          { word: 'exciting' },
          ' và có nhiều khán giả ',
          { word: 'audience' },
          '.'
        ]
      },
      {
        id: 'lp4-14',
        part: 4,
        section: 14,
        topic: 'Security camera',
        content: [
          'Camera giám sát ',
          { word: 'security camera' },
          ' bị hỏng làm mọi người lo lắng không cần thiết ',
          { word: 'unnecessarily worried' },
          ' và cần được trấn an ',
          { word: 'reassured' },
          '.'
        ]
      },
      {
        id: 'lp4-15',
        part: 4,
        section: 15,
        topic: "musician's life",
        content: [
          'Nhạc sĩ ',
          { word: 'musician' },
          ' thường nghỉ hưu ',
          { word: 'retire' },
          ' khi đã thành công ',
          { word: 'successful' },
          '.'
        ]
      },
      {
        id: 'lp4-16',
        part: 4,
        section: 16,
        topic: 'a new guide book',
        content: [
          'Hướng dẫn mới ',
          { word: 'new guide' },
          ' có nhiều thử thách ',
          { word: 'adventure' },
          ' và phù hợp cho thế hệ trẻ ',
          { word: 'suitable for particular' },
          '.'
        ]
      },
      {
        id: 'lp4-17',
        part: 4,
        section: 17,
        topic: 'Working from home',
        content: [
          'Làm việc ở nhà ',
          { word: 'working from home' },
          ' không tốt như cô ấy tưởng; phải ',
          { word: 'adapt' },
          ' theo ',
          { word: 'each situation' },
          ' mới tốt.'
        ]
      },
      {
        id: 'lp4-18',
        part: 4,
        section: 18,
        topic: 'criticism of a new novel',
        content: [
          'Tiểu thuyết mới ',
          { word: 'new novel' },
          ' thì có nhân vật ',
          { word: 'character' },
          ' thú vị nên tạo ra ',
          { word: 'establish' },
          ' sự nổi tiếng cho tác giả.'
        ]
      },
      {
        id: 'lp4-19',
        part: 4,
        section: 19,
        topic: 'TV series',
        content: [
          'Phim truyền hình ',
          { word: 'TV series' },
          ' thu hút sự chú ý ',
          { word: 'attention' },
          ' của khán giả thì sẽ bùng nổ — ',
          { word: 'overexposure' },
          '.'
        ]
      },
      {
        id: 'lp4-20',
        part: 4,
        section: 20,
        topic: 'The importance of sleep',
        content: [
          'Để ngủ ',
          { word: 'sleep' },
          ' chỉ đơn giản là không nên có ánh sáng ',
          { word: 'light' },
          ' và tiếng ồn ',
          { word: 'noise' },
          ' nhưng lại bị trầm trọng hoá ',
          { word: 'overemphasize' },
          '.'
        ]
      },
      {
        id: 'lp4-21',
        part: 4,
        section: 21,
        topic: 'a break from studying',
        content: [
          'Sau khi nghỉ học thì tôi đi học cao học ',
          { word: 'higher education' },
          ' vì chưa muốn tự lập ',
          { word: 'independent' },
          '.'
        ]
      },
      {
        id: 'lp4-22',
        part: 4,
        section: 22,
        topic: 'Research about happiness',
        content: [
          'Nghiên cứu về sự hạnh phúc ',
          { word: 'happiness' },
          ' được quảng bá trên truyền thông ',
          { word: 'media' },
          ' nhưng chưa tìm được đáp án trả lời ',
          { word: 'answer' },
          '.'
        ]
      },
      {
        id: 'lp4-23',
        part: 4,
        section: 23,
        topic: 'Restaurant',
        content: [
          'Nhà hàng ',
          { word: 'restaurant' },
          ' thì có dịch vụ',
          { word: 'service' },
          ' và giá trị ',
          { word: 'valued' },
          ' tốt.'
        ]
      }
    ]
  };

  // --- STATE ---
  const [skill, setSkill] = useState('Reading');
  const [part, setPart] = useState(1);
  const [section, setSection] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  /** Kéo từ kho: mỗi chip một slotId để cùng một từ xuất hiện nhiều lần vẫn kéo riêng từng thẻ. */
  const [draggedFromBank, setDraggedFromBank] = useState(null);
  const [consumedBankSlots, setConsumedBankSlots] = useState(() => new Set());
  const [answers, setAnswers] = useState({}); 
  const [isCompleted, setIsCompleted] = useState(false);

  // --- DERIVED STATE ---
  const currentItems = useMemo(() => {
    return initialData[skill]?.filter(item => item.part === part && item.section === section) || [];
  }, [skill, part, section]);

  const wordBankSlots = useMemo(() => {
    if (skill === 'Listening' && part === 3) return [];
    const slots = [];
    currentItems.forEach(item => {
      if (!item.isStatic) {
        if (skill === 'Reading' || (skill === 'Listening' && part === 4 && item.content)) {
          (item.content || []).forEach((p, idx) => {
            if (p && typeof p === 'object' && p.word) {
              slots.push({ slotId: `${item.id}__bank-${idx}`, word: p.word });
            }
          });
        } else if (skill === 'Listening') {
          slots.push({ slotId: `${item.id}__answer`, word: item.a });
        }
      }
    });
    return slots.sort(() => Math.random() - 0.5);
  }, [currentItems, skill, part]);

  /** Reading & Listening P4: kho từ kéo vào ô; Listening P1/P2: kho đáp án. P3 không có cột phải. */
  const showSideBank = !currentItems[0]?.isStatic && wordBankSlots.length > 0;

  const maxParts = useMemo(() => (skill === 'Listening' ? 4 : 5), [skill]);

  const maxSectionsInPart = useMemo(() => {
    const sections = initialData[skill]?.filter(i => i.part === part).map(i => i.section) || [];
    return sections.length > 0 ? Math.max(...sections) : 0;
  }, [skill, part]);

  const sectionComplete = useMemo(
    () => isSectionComplete(currentItems, answers),
    [currentItems, answers]
  );

  // --- EFFECTS ---
  useEffect(() => {
    // Chỉ reset khi thực sự chuyển đổi Part hoặc Skill hoặc Section
    setAnswers({});
    setConsumedBankSlots(new Set());
    setDraggedFromBank(null);
    setIsCompleted(false);
    setSearch('');
  }, [skill, part, section]);

  /** Hoàn thành đủ ô → sau 2 giây chuyển section tiếp (hoặc đánh dấu xong ở section cuối). */
  useEffect(() => {
    if (!sectionComplete || maxSectionsInPart < 1) return;
    // Tránh lặp timer khi đã đánh dấu xong part (section cuối).
    if (section >= maxSectionsInPart && isCompleted) return;

    const timerId = window.setTimeout(() => {
      if (section >= maxSectionsInPart) {
        setIsCompleted(true);
      } else {
        setSection(s => s + 1);
      }
    }, 2000);

    return () => clearTimeout(timerId);
  }, [sectionComplete, section, maxSectionsInPart, isCompleted]);

  // --- HANDLERS ---
  const handleDrop = (targetId, expectedValue) => {
    if (!draggedFromBank || consumedBankSlots.has(draggedFromBank.slotId)) return;
    const { word, slotId } = draggedFromBank;
    if (word.toLowerCase().trim() === expectedValue.toLowerCase().trim()) {
      setAnswers(prev => ({ ...prev, [targetId]: word }));
      setConsumedBankSlots(prev => new Set(prev).add(slotId));
    } else {
      const el = document.getElementById(`drop-${targetId}`);
      if(el) {
          el.classList.add('animate-shake', 'bg-red-50', 'border-red-400');
          setTimeout(() => el.classList.remove('animate-shake', 'bg-red-50', 'border-red-400'), 500);
      }
    }
    setDraggedFromBank(null);
  };

  const handleDropdownChange = (statementId, value) => {
    setAnswers(prev => ({ ...prev, [statementId]: value }));
  };

  const selectSkill = (s) => {
    setSkill(s); setPart(1); setSection(1); setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="relative shrink-0">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl transition-all font-bold text-slate-700 shadow-sm">
                {skill === 'Reading' ? <BookOpen className="w-5 h-5 text-indigo-600"/> : <Headphones className="w-5 h-5 text-indigo-600"/>}
                <span>{skill}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {['Reading', 'Listening', 'Writing', 'Speaking'].map(s => (
                    <button key={s} onClick={() => selectSkill(s)} className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 ${skill === s ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50'}`}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-0.5 sm:space-x-1 ml-2 sm:ml-4 border-l border-slate-200 pl-2 sm:pl-4 overflow-x-auto overscroll-x-contain touch-pan-x min-w-0 flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: maxParts }, (_, i) => i + 1).map(p => (
                <button key={p} type="button" onClick={() => {setPart(p); setSection(1);}} className={`shrink-0 px-2.5 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${part === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>P{p}</button>
              ))}
            </div>
          </div>
          <div className="font-black text-indigo-600 tracking-tighter italic text-lg sm:text-xl uppercase tracking-widest shrink-0">Aptis PRO</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="text-center mb-10 mt-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight italic">Chinh Phục Từ Vựng</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            {skill} • Part {part} {maxSectionsInPart > 1 ? `• Section ${section}` : ''}
          </p>
        </div>

        {currentItems.length > 0 ? (
          <div
            className={
              showSideBank
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] gap-8 lg:gap-10 items-start'
                : 'flex flex-col space-y-8'
            }
          >
            {showSideBank && (
              <aside className="order-1 lg:order-2 lg:col-start-2 row-start-1 sticky top-20 z-40 w-full self-start">
                <div className="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-[28px] shadow-xl border border-indigo-100 ring-1 ring-indigo-50/80">
                  <div className="flex flex-col gap-4 mb-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        {part === 4 && skill === 'Listening' ? 'Kho từ vựng' : 'Kho đáp án'}
                      </h3>
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 font-mono">
                        {wordBankSlots.length - consumedBankSlots.size} còn lại
                      </span>
                    </div>
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder={part === 4 && skill === 'Listening' ? 'Tìm từ nhanh…' : 'Tìm đáp án nhanh...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5 max-h-[min(42vh,240px)] lg:max-h-[min(70vh,560px)] overflow-y-auto pr-1 scrollbar-hide border-t border-slate-100 pt-4">
                    {wordBankSlots
                      .filter(({ word }) => word.toLowerCase().includes(search.toLowerCase().trim()))
                      .map(({ slotId, word }) => {
                        const isUsed = consumedBankSlots.has(slotId);
                        const isSelected = draggedFromBank?.slotId === slotId;
                        return (
                          <button
                            key={slotId}
                            type="button"
                            draggable={!isUsed}
                            onDragStart={() => setDraggedFromBank({ slotId, word })}
                            onClick={() =>
                              setDraggedFromBank(isSelected ? null : { slotId, word })
                            }
                            className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all border-2 ${
                              part === 4 && skill === 'Listening'
                                ? isUsed
                                  ? 'opacity-20 cursor-not-allowed border-transparent bg-slate-100'
                                  : isSelected
                                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg scale-95'
                                    : 'bg-white text-violet-800 border-violet-100 hover:border-violet-400 shadow-sm whitespace-nowrap'
                                : isUsed
                                  ? 'opacity-20 cursor-not-allowed border-transparent bg-slate-100'
                                  : isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-95'
                                    : 'bg-white text-indigo-700 border-slate-100 hover:border-indigo-500 shadow-sm active:scale-95 whitespace-nowrap'
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </aside>
            )}
            <div className={`space-y-6 min-w-0 ${showSideBank ? 'order-2 lg:order-1 lg:col-start-1' : ''}`}>
              {currentItems.map(item => (
                <QuestionCard
                  key={item.id}
                  item={item}
                  answers={answers}
                  skill={skill}
                  onDrop={handleDrop}
                  onDropdownChange={handleDropdownChange}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
             <Info className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold">Dữ liệu chưa sẵn sàng</p>
          </div>
        )}

        {maxSectionsInPart > 1 && (
          <div className="mt-20 pt-10 border-t border-slate-200 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Chọn Section</p>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: maxSectionsInPart }, (_, i) => i + 1).map(s => (
                <button key={s} onClick={() => setSection(s)} className={`w-16 h-16 rounded-2xl text-xl font-black transition-all border-2 ${section === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-110' : 'bg-white text-slate-300 border-slate-100 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'}`}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .drop-zone { display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; height: 44px; background: #f8fafc; border-radius: 12px; font-weight: 800; color: #4f46e5; transition: all 0.3s; line-height: 1.2; text-align: center; }
        .correct { background-color: #dcfce7 !important; border-color: #22c55e !important; color: #166534 !important; border-style: solid !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;