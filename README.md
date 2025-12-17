# -2# ----------------------------------------------------------------------
# 🎓 卒業制作: 合意の「正当性」評価ロジック (Python基本実装)
# ----------------------------------------------------------------------

# --- 1. データ構造の定義 ---

# 参加者情報
PARTICIPANTS = ["Aさん", "Bさん", "Cさん", "Dさん"]

# 議題と選択肢
DECISION_TOPIC = "来年度のゼミ研究テーマ"
OPTIONS = {
    "O1": "AIと倫理に関する調査研究",
    "O2": "SNSの利用実態とメンタルヘルス",
    "O3": "地域経済活性化のためのデータ分析"
}

# 意見・発言ログの構造
# 'p': participant, 't': type (提案/賛成/反対/質問/根拠提示/意見変更/投票), 'o': target_option, 
# 'c': content, 'r': references_shared_info (情報/根拠の有無 True/False)
AGREEMENT_LOGS = [
    {"p": "Aさん", "t": "提案", "o": "O1", "c": "AIのテーマは将来性があり、トレンドだ。", "r": True},
    {"p": "Bさん", "t": "賛成", "o": "O1", "c": "教授の専門とも近いので指導を受けやすい。", "r": True},
    {"p": "Cさん", "t": "反対", "o": "O1", "c": "既に多くのゼミで扱っており、オリジナリティに欠ける。", "r": False},
    {"p": "Cさん", "t": "提案", "o": "O2", "c": "O2は社会的な問題提起として価値が高い。", "r": True},
    {"p": "Dさん", "t": "質問", "o": "O2", "c": "O2の調査方法の具体性は？", "r": False},
    {"p": "Bさん", "t": "根拠提示", "o": "O2", "c": "先行研究ではこの調査方法が有効。", "r": True},
    {"p": "Aさん", "t": "意見変更", "o": "O2", "c": "確かにO2の方がテーマとして深い。", "r": False},
    {"p": "Dさん", "t": "投票", "o": "O2", "c": "最終的にO2に決定。", "r": False},
    {"p": "Cさん", "t": "投票", "o": "O2", "c": "O2に投票。", "r": False},
    {"p": "Bさん", "t": "投票", "o": "O2", "c": "O2に投票。", "r": False},
]

# --- 2. 正当性スコア算出ロジック ---

def calculate_legitimacy_score(participants, options, logs):
    """
    合意の正当性を4つの観点から評価し、統合スコアを算出する関数。
    各観点の満点は25点とし、合計で最大100点とする。
    """
    num_participants = len(participants)
    num_options = len(options)
    
    scores = {}

    # 1. 参加の正当性 (Participation Legitimacy)
    participant_contributions = {p: 0 for p in participants}
    for log in logs:
        if log['t'] != '投票':
            participant_contributions[log['p']] += 1
            
    # 参加率 (全員が一度以上発言したか) [最大25*0.5=12.5点]
    all_participated = sum(1 for count in participant_contributions.values() if count > 0)
    scores['participation_completeness'] = (all_participated / num_participants) * 12.5 
    
    # 参加の公平性 (発言の偏りの少なさ) [最大12.5点]
    contributions = list(participant_contributions.values())
    max_c, min_c = (max(contributions), min(contributions)) if contributions else (0, 0)
    if max_c > 0:
        # 発言回数の最大と最小の差が小さいほど高得点
        scores['participation_fairness'] = (1 - (max_c - min_c) / max_c) * 12.5
    else:
        scores['participation_fairness'] = 12.5

    # 2. 情報の正当性 (Information Legitimacy) [最大25点]
    # 根拠（'r'=True）を伴う発言の割合を評価。
    total_logs_excluding_vote = sum(1 for log in logs if log['t'] != '投票')
    referenced_logs = sum(1 for log in logs if log['t'] != '投票' and log['r'] == True)
    
    if total_logs_excluding_vote > 0:
        scores['information_support'] = (referenced_logs / total_logs_excluding_vote) * 25
    else:
        scores['information_support'] = 0
        
    # 3. 検討の正当性 (Deliberation Legitimacy)
    
    # 選択肢の多様性（検討された選択肢の数）[最大12.5点]
    options_discussed = set(log['o'] for log in logs if log['t'] != '投票')
    scores['deliberation_diversity'] = (len(options_discussed) / num_options) * 12.5
    
    # 反対意見の記録（少なくとも1つ記録されているか）[最大12.5点]
    has_opposition = any(log['t'] == '反対' for log in logs)
    scores['deliberation_opposition'] = 12.5 if has_opposition else 0

    # 4. プロセスの透明性 (Process Transparency) [最大25点]
    # 意見変更（熟慮の証）が記録されたか。
    has_opinion_change = any(log['t'] == '意見変更' for log in logs)
    scores['transparency_reflection'] = 25 if has_opinion_change else 0

    # --- 最終スコア統合 ---
    
    integrated_score = sum(scores.values())
    
    score_summary = {
        "参加の正当性": scores['participation_completeness'] + scores['participation_fairness'],
        "情報の正当性": scores['information_support'],
        "検討の正当性": scores['deliberation_diversity'] + scores['deliberation_opposition'],
        "プロセスの透明性": scores['transparency_reflection'],
        "総合正当性スコア": integrated_score
    }
    
    # --- フィードバック生成 ---
    feedback = []
    
    # 参加のフィードバック
    if scores['participation_completeness'] < 12.5:
        unparticipated = [p for p, count in participant_contributions.items() if count == 0]
        feedback.append(f"⚠️ 参加の偏り: {', '.join(unparticipated)} が議論に参加していません。発言機会の均等化が必要です。")
        
    # 情報のフィードバック
    if scores['information_support'] < 25 * 0.5: # 根拠付き発言が50%未満の場合
        feedback.append("🔍 根拠不足: 意見交換に占める根拠を伴う発言の割合が低いです。情報共有を促進しましょう。")
        
    # 検討のフィードバック
    if scores['deliberation_diversity'] < 12.5:
        undiscussed_options = sorted(list(set(options.keys()) - options_discussed))
        feedback.append(f"🔄 検討不足: {len(undiscussed_options)}個の選択肢（{', '.join(undiscussed_options)}など）が十分に議論されませんでした。")
    
    return score_summary, feedback

# --- 3. 実行と結果出力 ---

score_result, feedback_list = calculate_legitimacy_score(PARTICIPANTS, OPTIONS, AGREEMENT_LOGS)

print(f"## 議題: {DECISION_TOPIC} の正当性評価レポート")
print("-" * 50)

print("\n### 観点別スコア (理論上の満点: 各25点, 総合100点)")
for key, value in score_result.items():
    if "総合" in key:
        print(f"\n**{key}: {value:.2f}点**")
    else:
        print(f" - {key}: {value:.2f}点")

print("\n### システムによるフィードバック")
if feedback_list:
    for fb in feedback_list:
        print(fb)
else:
    print("✅ この合意プロセスは、概ね高い正当性を確保しています。")

