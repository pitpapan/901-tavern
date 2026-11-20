// Same source and pre-last-message convention as SillyTavern's manual Summary.
// Read only the active message extra: discarded swipe_info is never consulted.
export function retainedBranchMemory(chat) {
  for (let i=chat.length-2;i>=0;i--) {
    const memory=chat[i].extra?.memory;
    if(typeof memory==='string'&&memory.trim())
      return '【当前保留分支的人工采纳记忆；后续实际聊天与程序结算优先】\n'+memory.trim();
  }
  return '';
}
