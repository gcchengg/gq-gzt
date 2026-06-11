import { useEffect, useRef } from "react";
import EvaluationExecution from "./components/EvaluationExecution";
import EvaluationModelScore from "./components/EvaluationModelScore";
import "./index.css";

export default function GztDemo() {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) return undefined;
    didMountRef.current = true;

    const viewport = document.getElementById('viewport');
        const drawer = document.getElementById('drawer');
        const drawerTitle = document.getElementById('drawer-title');
        const stagePill = document.getElementById('stage-pill');
        const tabs = Array.from(document.querySelectorAll('.sub-tab'));
        const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
        const panels = Array.from(document.querySelectorAll('.panel'));
        const footers = Array.from(document.querySelectorAll('.footer-set'));
        const roleButtons = Array.from(document.querySelectorAll('[data-role]'));
        const topicAddOverlay = document.getElementById('topic-add-overlay');
        const topicAddMask = topicAddOverlay?.querySelector('.topic-add-mask');
        const openTopicAdd = document.getElementById('open-topic-add');
        const closeTopicAdd = document.getElementById('close-topic-add');
        const saveTopicAdd = document.getElementById('save-topic-add');
        const evalHomeTabs = Array.from(document.querySelectorAll('[data-eval-home-tab]'));
        const evalHomePanes = Array.from(document.querySelectorAll('[data-eval-home-pane]'));
        const auditTabs = Array.from(document.querySelectorAll('[data-audit-tab]'));
        const auditPanes = Array.from(document.querySelectorAll('[data-audit-pane]'));
        const workflowPanes = Array.from(document.querySelectorAll('[data-workflow-pane]'));
        const auditMinutesOverlay = document.getElementById('audit-minutes-overlay');
        const auditMinutesMask = auditMinutesOverlay?.querySelector('.audit-minutes-mask');
        const auditMinutesClose = document.getElementById('audit-minutes-close');
        const auditMinutesOpeners = Array.from(document.querySelectorAll('[data-open-audit-minutes]'));
        const evalDetailOverlay = document.getElementById('eval-detail-overlay');
        const evalDetailMask = evalDetailOverlay?.querySelector('.eval-detail-mask');
        const evalDetailClose = document.getElementById('eval-detail-close');
        const evalDetailTabs = Array.from(document.querySelectorAll('[data-eval-detail-tab]'));
        const evalDetailPanes = Array.from(document.querySelectorAll('[data-eval-detail-pane]'));
        const evalOpeners = Array.from(document.querySelectorAll('[data-open-eval-detail]'));
        const evalPrevNext = Array.from(document.querySelectorAll('[data-eval-next], [data-eval-prev]'));
        const evalModalOpeners = Array.from(document.querySelectorAll('[data-open-eval-modal]'));
        const evalModalClosers = Array.from(document.querySelectorAll('[data-close-eval-modal]'));
        const evalAttachModal = document.getElementById('eval-attach-modal');
        const evalModelModal = document.getElementById('eval-model-modal');
        const evalSupplementOverlay = document.getElementById('eval-supplement-overlay');
        const evalPreviewOverlay = document.getElementById('eval-preview-overlay');
        const openEvalSupplement = document.getElementById('open-eval-supplement');
        const openEvalPreview = document.getElementById('open-eval-preview');
        const closeEvalSupplement = document.getElementById('close-eval-supplement');
        const closeEvalPreview = document.getElementById('close-eval-preview');
        const saveEvalSupplement = document.getElementById('save-eval-supplement');
        const pdfEditorOverlay = document.getElementById('pdf-editor-overlay');
        const pdfEditorBack = document.getElementById('pdf-editor-back');
        const pdfFileSwitch = document.getElementById('pdf-file-switch');
        const pdfToolbarLabel = document.getElementById('pdf-toolbar-label');
        const pdfPageLinkToggle = document.getElementById('pdf-page-link-toggle');
        const pdfLinkConfirm = document.getElementById('pdf-link-confirm');
        const pdfLinkConfirmOk = document.getElementById('pdf-link-confirm-ok');
        const pdfLinkConfirmCancel = document.getElementById('pdf-link-confirm-cancel');
        const pdfToolbarCancel = document.getElementById('pdf-toolbar-cancel');
        const pdfToolbarHint = document.getElementById('pdf-toolbar-hint');
        const pdfFileOpeners = Array.from(document.querySelectorAll('[data-open-pdf-editor]'));
        const evalAnnotationOpeners = Array.from(document.querySelectorAll('[data-open-pdf-annotation]'));
        const pdfModeButtons = Array.from(document.querySelectorAll('[data-pdf-mode]'));
        const pdfPageChips = Array.from(document.querySelectorAll('[data-pdf-page-chip]'));
        const pdfPages = Array.from(document.querySelectorAll('[data-pdf-page]'));
        const pdfPagePrev = document.getElementById('pdf-page-prev');
        const pdfPageNext = document.getElementById('pdf-page-next');
        const pdfPageMinus = document.getElementById('pdf-page-minus');
        const pdfPagePlus = document.getElementById('pdf-page-plus');
        const pdfPageInput = document.getElementById('pdf-page-input');
        const pdfPageTotal = document.getElementById('pdf-page-total');
        const pdfCanvasList = Array.from(document.querySelectorAll('[data-pdf-canvas]'));
        const pdfTaskCards = () => Array.from(document.querySelectorAll('[data-annotation-card]'));
        const pdfAnnotationNodes = () => Array.from(document.querySelectorAll('[data-annotation-id], [data-selectable-id]'));
        const pdfScroll = document.getElementById('pdf-scroll');
        const pdfTaskList = document.getElementById('pdf-task-list');
        const pdfTaskAdd = document.getElementById('pdf-task-add');
        const pdfSideTitle = document.getElementById('pdf-side-title');
        const pdfBottomDock = document.getElementById('pdf-bottom-dock');
        const pdfProposalSelect = document.getElementById('pdf-proposal-select');
        const pdfBottomAttachPanel = document.getElementById('pdf-bottom-attach-panel');
        const pdfBottomFileOpeners = () => Array.from(document.querySelectorAll('.pdf-bottom-attach-file[data-open-pdf-editor]'));
        const pdfBottomCompareButtons = () => Array.from(document.querySelectorAll('.pdf-bottom-row-compare'));
        const pdfEditorBody = document.querySelector('.pdf-editor-body');
        const pdfCompareInline = document.getElementById('pdf-compare-inline');
        const pdfCompareInlineBack = document.getElementById('pdf-compare-inline-back');
        const pdfCompareOverlay = document.getElementById('pdf-compare-overlay');
        const pdfCompareMask = pdfCompareOverlay?.querySelector('.pdf-compare-mask');
        const pdfCompareClose = document.getElementById('pdf-compare-close');
        const evalAttachTrigger = document.getElementById('eval-attach-trigger');
        const evalAttachMeta = document.getElementById('eval-attach-meta');
        const evalAttachTitle = document.getElementById('eval-attach-title');
        const evalAttachNote = document.getElementById('eval-attach-note');
        const evalAttachTable = document.getElementById('eval-attach-table');
        const evalAttachToolbarBtn = document.getElementById('eval-attach-toolbar-btn');
        const evalAttachConfirm = document.getElementById('eval-attach-confirm');
        const pdfNotePop = document.getElementById('pdf-note-pop');
        const pdfNoteInput = document.getElementById('pdf-note-input');
        const pdfNoteCancel = document.getElementById('pdf-note-cancel');
        const pdfNoteSave = document.getElementById('pdf-note-save');
        const pdfNoteNeedReplyInputs = Array.from(document.querySelectorAll('input[name="pdf-note-need-reply"]'));
        const progressOrder = ['submit', 'evaluate', 'audit', 'advice', 'vote', 'execute', 'finish'];
        const progressNumbers = { submit: '1', evaluate: '2', audit: '3', advice: '4', vote: '5', execute: '6', finish: '7' };
        const pdfHintCopy = {
          all: '勾选关联此页即可关联当前页',
          existing: '勾选关联此页即可关联当前页',
          new: '点击正文或拖拽区域后创建批注并关联',
          area: '拖动鼠标绘制矩形区域',
          text: '点击正文高亮文本后填写说明'
        };
        let pdfMode = 'area';
        let pdfDraft = null;
        let pdfDrawingState = null;
        let pdfAnnotationSeed = 3;
        let pdfToolbarVisible = false;
        let currentPdfPage = '1';
        let pdfCreatePending = false;
        let evalAttachLinked = false;
        let evalAttachMode = 'attach';
        let currentPdfScope = 'full';
        let currentPdfFile = 'file-1';
        let currentPdfContext = 'attach';
        let pdfCompareMode = false;
        let pendingLinkedPage = null;
        let pdfReturnToReviewPage = false;
        let pdfReviewSourceMode = false;
        const comparePagerState = { '1': 1, '2': 2 };
        const pdfLinkedPages = new Set();
        const evalAttachTotal = 4;
        const evalAttachSelected = new Set();
    
        function scaleViewport() {
          const scale = Math.min(window.innerWidth / 2048, window.innerHeight / 1159);
          viewport.style.height = `${window.innerHeight / scale}px`;
          viewport.style.transform = `scale(${scale})`;
        }
    
        function activateRole(role) {
          const nextRole = ['manager', 'finance', 'legal'].includes(role) ? role : 'manager';
          document.body.classList.toggle('role-finance', nextRole === 'finance');
          document.body.classList.toggle('role-legal', nextRole === 'legal');
          roleButtons.forEach(button => button.classList.toggle('active', button.dataset.role === nextRole));
          if (nextRole === 'finance') {
            drawer.classList.remove('evaluate-mode', 'audit-mode', 'workflow-mode', 'material-page');
            if (drawerTitle) drawerTitle.textContent = '三会议题初审';
            if (stagePill) stagePill.textContent = '财务初审中';
          } else if (nextRole === 'legal') {
            document.body.classList.remove('role-finance');
            drawer.classList.remove('evaluate-mode', 'audit-mode', 'workflow-mode', 'material-page');
            roleButtons.forEach(button => button.classList.toggle('active', button.dataset.role === 'legal'));
            if (drawerTitle) drawerTitle.textContent = '三会议题法务初审';
            if (stagePill) stagePill.textContent = '法务初审中';
          } else {
            document.body.classList.remove('role-finance');
            document.body.classList.remove('role-legal');
            activateProgressStep(window.location.hash.replace('#', '') || 'submit');
          }
        }
    
        function activateTab(name) {
          document.body.classList.remove('role-finance');
          document.body.classList.remove('role-legal');
          roleButtons.forEach(button => button.classList.toggle('active', button.dataset.role === 'manager'));
          tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === name));
          panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === name));
          footers.forEach(footer => footer.classList.toggle('active', footer.dataset.footer === name));
          drawer.classList.toggle('material-page', name === 'materials');
          drawer.classList.remove('evaluate-mode');
          drawer.classList.remove('audit-mode');
          drawer.classList.remove('workflow-mode');
          if (drawerTitle) drawerTitle.textContent = '议题提报';
          if (stagePill) stagePill.textContent = '议题提报中';
          closeTopicAddDrawer();
          closeEvalDetail();
        }
    
        function activateProgressStep(stepName) {
          document.body.classList.remove('role-finance');
          document.body.classList.remove('role-legal');
          roleButtons.forEach(button => button.classList.toggle('active', button.dataset.role === 'manager'));
          const activeIndex = progressOrder.indexOf(stepName);
          progressSteps.forEach((step, index) => {
            const isActive = step.dataset.step === stepName;
            const isDone = index < activeIndex;
            const circle = step.querySelector('.circle');
            step.classList.toggle('active', isActive);
            step.classList.toggle('done', isDone);
            step.classList.toggle('muted', isDone && index === 0);
            if (circle) {
              circle.textContent = isDone ? '✓' : progressNumbers[step.dataset.step] || '';
            }
          });
          if (stepName === 'submit') {
            activateTab(document.querySelector('.sub-tab.active')?.dataset.tab || 'ai');
          } else if (stepName === 'evaluate') {
            drawer.classList.add('evaluate-mode');
            drawer.classList.remove('audit-mode');
            drawer.classList.remove('workflow-mode');
            if (drawerTitle) drawerTitle.textContent = '议题评估';
            if (stagePill) stagePill.textContent = '议题评估中';
            activateEvalHomeTab('list');
          } else if (stepName === 'audit') {
            drawer.classList.add('audit-mode');
            drawer.classList.remove('evaluate-mode');
            drawer.classList.remove('workflow-mode');
            if (drawerTitle) drawerTitle.textContent = '议题审核';
            if (stagePill) stagePill.textContent = '议题审核中';
            activateAuditTab('qa');
          } else if (['advice', 'vote', 'execute'].includes(stepName)) {
            drawer.classList.add('workflow-mode');
            drawer.classList.remove('evaluate-mode');
            drawer.classList.remove('audit-mode');
            const titleMap = { advice: '表决建议', vote: '三会表决', execute: '决策执行' };
            if (drawerTitle) drawerTitle.textContent = titleMap[stepName];
            if (stagePill) stagePill.textContent = titleMap[stepName];
            activateWorkflowPane(stepName);
          } else {
            drawer.classList.remove('evaluate-mode');
            drawer.classList.remove('audit-mode');
            drawer.classList.remove('workflow-mode');
            if (drawerTitle) drawerTitle.textContent = '议题提报';
            if (stagePill) stagePill.textContent = '议题提报中';
          }
          closeTopicAddDrawer();
          closeEvalDetail();
          window.location.hash = stepName;
        }
    
        function activateWorkflowPane(name) {
          workflowPanes.forEach(pane => pane.classList.toggle('active', pane.dataset.workflowPane === name));
        }
    
        function openTopicAddDrawer() {
          if (!topicAddOverlay) return;
          topicAddOverlay.classList.add('open');
          topicAddOverlay.setAttribute('aria-hidden', 'false');
        }
    
        function closeTopicAddDrawer() {
          if (!topicAddOverlay) return;
          topicAddOverlay.classList.remove('open');
          topicAddOverlay.setAttribute('aria-hidden', 'true');
        }
    
        function openAuditMinutesDrawer() {
          if (!auditMinutesOverlay) return;
          auditMinutesOverlay.classList.add('open');
          auditMinutesOverlay.setAttribute('aria-hidden', 'false');
        }
    
        function closeAuditMinutesDrawer() {
          if (!auditMinutesOverlay) return;
          auditMinutesOverlay.classList.remove('open');
          auditMinutesOverlay.setAttribute('aria-hidden', 'true');
        }
    
        function activateEvalHomeTab(name) {
          evalHomeTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.evalHomeTab === name));
          evalHomePanes.forEach(pane => pane.classList.toggle('active', pane.dataset.evalHomePane === name));
        }
    
        function activateAuditTab(name) {
          auditTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.auditTab === name));
          auditPanes.forEach(pane => pane.classList.toggle('active', pane.dataset.auditPane === name));
        }
    
        function activateEvalDetailTab(name) {
          evalDetailTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.evalDetailTab === name));
          evalDetailPanes.forEach(pane => pane.classList.toggle('active', pane.dataset.evalDetailPane === name));
        }
    
        function openEvalDetail(startTab = 'execute') {
          if (!evalDetailOverlay) return;
          evalDetailOverlay.classList.add('open');
          evalDetailOverlay.setAttribute('aria-hidden', 'false');
          activateEvalDetailTab(startTab);
        }
    
        function closeEvalDetail() {
          if (!evalDetailOverlay) return;
          closePdfEditor();
          evalDetailOverlay.classList.remove('open');
          evalDetailOverlay.setAttribute('aria-hidden', 'true');
          closeEvalModal();
          closeEvalSupplementOverlay();
          closeEvalPreviewOverlay();
        }
    
        function openEvalModal(name) {
          if (name === 'attach' || name === 'annotation') {
            evalAttachMode = name;
            if (evalAttachTitle) evalAttachTitle.textContent = name === 'annotation' ? '关联批注' : '附件确认';
            if (evalAttachNote) {
              evalAttachNote.textContent = name === 'annotation'
                ? '请选择需要关联批注的 PDF 附件。此处不支持重新上传附件，也不可更改勾选附件。'
                : '请勾选当前议题需要关联的附件，PDF 文件可点击进入批注编辑。';
            }
            if (evalAttachToolbarBtn) {
              evalAttachToolbarBtn.textContent = name === 'annotation' ? '已关联附件' : '关联附件';
              evalAttachToolbarBtn.style.display = name === 'annotation' ? 'none' : 'inline-flex';
            }
            evalAttachTable?.classList.toggle('readonly', name === 'annotation');
            evalAttachModal?.classList.add('open');
            evalAttachModal?.setAttribute('aria-hidden', 'false');
            return;
          }
          const modal = name === 'model' ? evalModelModal : null;
          if (!modal) return;
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
        }
    
        function closeEvalModal() {
          [evalAttachModal, evalModelModal].forEach(modal => {
            if (!modal) return;
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
          });
        }
    
        function openEvalSupplementOverlay() {
          if (!evalSupplementOverlay) return;
          evalSupplementOverlay.classList.add('open');
          evalSupplementOverlay.setAttribute('aria-hidden', 'false');
        }
    
        function closeEvalSupplementOverlay() {
          if (!evalSupplementOverlay) return;
          evalSupplementOverlay.classList.remove('open');
          evalSupplementOverlay.setAttribute('aria-hidden', 'true');
        }
    
        function openEvalPreviewOverlay() {
          if (!evalPreviewOverlay) return;
          evalPreviewOverlay.classList.add('open');
          evalPreviewOverlay.setAttribute('aria-hidden', 'false');
        }
    
        function closeEvalPreviewOverlay() {
          if (!evalPreviewOverlay) return;
          evalPreviewOverlay.classList.remove('open');
          evalPreviewOverlay.setAttribute('aria-hidden', 'true');
        }
    
        function syncAttachTrigger() {
          if (!evalAttachTrigger) return;
          evalAttachTrigger.classList.toggle('pending', !evalAttachLinked);
          evalAttachTrigger.classList.toggle('primary', evalAttachLinked);
          evalAttachTrigger.textContent = evalAttachLinked ? '关联附件' : '未关联附件';
        }
    
        function updateAttachMeta() {
          if (!evalAttachMeta) return;
          const count = evalAttachSelected.size;
          evalAttachMeta.innerHTML = `
            <div class="eval-attach-row head">
              <div class="eval-attach-check"><span class="topic-check"></span></div>
              <div class="eval-attach-index">序号</div>
              <div>文件名</div>
              <div>批注</div>
              <div>操作</div>
            </div>
            <div class="eval-attach-row">
              <div class="eval-attach-check"><span class="topic-check"></span></div>
              <div class="eval-attach-index">1</div>
              <div class="eval-attach-name">1.png</div>
              <span class="eval-attach-note-pill yellow">不可批注</span>
              <div class="eval-attach-op">删除</div>
            </div>
            <div class="eval-attach-row">
              <div class="eval-attach-check"><span class="topic-check"></span></div>
              <div class="eval-attach-index">2</div>
              <div class="eval-attach-name">1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</div>
              <span class="eval-attach-note-pill yellow">不可批注</span>
              <div class="eval-attach-op">删除</div>
            </div>
            <div class="eval-attach-row">
              <div class="eval-attach-check"><span class="topic-check"></span></div>
              <div class="eval-attach-index">3</div>
              <div class="eval-attach-name"><button class="pdf-file-link" data-open-main-pdf="20250428中联电子议题关键信息页(1).pdf" type="button">20250428中联电子议题关键信息页(1).pdf</button></div>
              <span class="eval-attach-note-pill ${count > 0 ? 'blue' : 'red'}">${count > 0 ? `${count}条批注` : '0条批注'}</span>
              <div class="eval-attach-op">删除</div>
            </div>
            <div class="eval-attach-row">
              <div class="eval-attach-check"><span class="topic-check"></span></div>
              <div class="eval-attach-index">4</div>
              <div class="eval-attach-name"><button class="pdf-file-link" data-open-main-pdf="20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf" type="button">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</button></div>
              <span class="eval-attach-note-pill blue">3条批注</span>
              <div class="eval-attach-op">删除</div>
            </div>
          `;
        }
    
        function syncAttachSelectionUI() {
          evalAttachTable?.querySelectorAll('tbody tr').forEach(row => {
            const id = row.dataset.attachId;
            const check = row.querySelector('.topic-check');
            const selected = evalAttachSelected.has(id);
            row.classList.toggle('selected', selected);
            check?.classList.toggle('checked', selected);
          });
        }
    
        function toggleAttachSelection(row) {
          if (!row || evalAttachMode !== 'attach') return;
          const id = row.dataset.attachId;
          if (!id) return;
          if (evalAttachSelected.has(id)) {
            evalAttachSelected.delete(id);
          } else {
            evalAttachSelected.add(id);
          }
          syncAttachSelectionUI();
        }
    
        function setPdfMode(mode) {
          pdfMode = mode;
          pdfModeButtons.forEach(button => button.classList.toggle('active', button.dataset.pdfMode === mode));
          pdfCanvasList.forEach(canvas => {
            canvas.classList.toggle('text-mode', mode === 'text');
            canvas.classList.toggle('idle', !pdfToolbarVisible || !['area', 'new'].includes(mode));
          });
          if (pdfToolbarHint) pdfToolbarHint.textContent = pdfHintCopy[mode] || '';
          if (mode === 'existing' || mode === 'all') {
            pdfCreatePending = false;
          }
          if (currentPdfContext === 'annotation') {
            if (mode === 'all') currentPdfScope = 'full';
            if (mode === 'existing') currentPdfScope = 'annotated';
            if (mode === 'new') currentPdfScope = 'unannotated';
            setActivePdfPage('1');
          }
          clearPdfDraft();
        }
    
        function setPdfToolbarVisible(visible) {
          pdfToolbarVisible = visible;
          pdfEditorOverlay?.classList.toggle('toolbar-visible', visible);
          pdfCanvasList.forEach(canvas => {
            canvas.classList.toggle('idle', !visible || !['area', 'new'].includes(pdfMode));
          });
        }
    
        function setPdfBottomDockVisible(visible) {
          if (!pdfBottomDock) return;
          if (pdfCompareMode) {
            pdfBottomDock.classList.remove('visible');
            return;
          }
          pdfBottomDock.classList.toggle('visible', visible);
        }
    
        function syncPdfBottomDock() {
          if (!pdfBottomDock) return;
          pdfBottomDock.classList.toggle('annotation-mode', currentPdfContext === 'annotation');
        }
    
        function syncPdfContextUI() {
          if (!pdfEditorOverlay) return;
          const isAnnotation = currentPdfContext === 'annotation';
          pdfEditorOverlay.classList.toggle('annotation-context', isAnnotation);
          if (pdfToolbarLabel) {
            pdfToolbarLabel.textContent = isAnnotation ? '关联类别：' : '标注模式：';
          }
          if (pdfSideTitle) {
            pdfSideTitle.textContent = isAnnotation ? '关联项列表' : '批注列表';
          }
          if (pdfTaskAdd) {
            pdfTaskAdd.style.display = isAnnotation ? 'none' : 'inline-flex';
          }
          if (isAnnotation) {
            setPdfToolbarVisible(true);
            setPdfMode('existing');
          }
        }
    
        function syncPdfProposalPanel() {
          if (!pdfBottomAttachPanel || !pdfProposalSelect) return;
          pdfBottomAttachPanel.classList.toggle('visible', !!pdfProposalSelect.value);
        }
    
        function syncComparePager(id) {
          const input = document.querySelector(`[data-compare-input="${id}"]`);
          const total = document.querySelector(`[data-compare-total="${id}"]`);
          const prev = document.querySelector(`[data-compare-prev="${id}"]`);
          const next = document.querySelector(`[data-compare-next="${id}"]`);
          const minus = document.querySelector(`[data-compare-minus="${id}"]`);
          const plus = document.querySelector(`[data-compare-plus="${id}"]`);
          const value = comparePagerState[id] || 1;
          if (input) input.value = String(value);
          if (total) total.textContent = '/ 10';
          if (prev) prev.disabled = value <= 1;
          if (minus) minus.disabled = value <= 1;
          if (next) next.disabled = value >= 10;
          if (plus) plus.disabled = value >= 10;
        }
    
        function exitPdfCompareMode() {
          pdfCompareMode = false;
          pdfEditorBody?.classList.remove('compare-mode');
          setPdfBottomDockVisible(false);
        }
    
        function openPdfCompareDrawer() {
          pdfCompareMode = true;
          pdfEditorBody?.classList.add('compare-mode');
          setPdfBottomDockVisible(false);
          syncComparePager('1');
          syncComparePager('2');
        }
    
        function openPdfEditor(scope = 'full', context = 'attach', options = {}) {
          if (!pdfEditorOverlay) return;
          pdfReturnToReviewPage = !!options.returnToReviewPage;
          pdfReviewSourceMode = !!options.reviewSource;
          if (evalDetailOverlay && !evalDetailOverlay.classList.contains('open')) {
            evalDetailOverlay.classList.add('open');
            evalDetailOverlay.setAttribute('aria-hidden', 'false');
            activateEvalDetailTab('execute');
          }
          closeEvalModal();
          currentPdfScope = scope;
          currentPdfContext = context;
          pdfEditorOverlay.classList.add('open');
          pdfEditorOverlay.setAttribute('aria-hidden', 'false');
          pdfEditorOverlay.classList.toggle('review-source', pdfReviewSourceMode);
          syncPdfTaskActionLabels();
          setPdfToolbarVisible(false);
          pdfCreatePending = false;
          setPdfMode('area');
          syncPdfBottomDock();
          syncPdfContextUI();
          syncPdfProposalPanel();
          setPdfBottomDockVisible(false);
          exitPdfCompareMode();
          setActivePdfPage('1');
          activatePdfAnnotation('area-1');
          if (currentPdfContext !== 'annotation' && pdfTaskAdd) {
            pdfTaskAdd.style.display = scope === 'annotated' ? 'none' : 'inline-flex';
          }
        }
    
        function openPdfEditorFromFileTrigger(trigger) {
          const isReviewPageFile = trigger?.closest('.finance-review-page, .legal-review-page');
          if (isReviewPageFile) {
            openPdfEditor('full', 'attach', { returnToReviewPage: true, reviewSource: true });
            return;
          }
          openPdfEditor(evalAttachMode === 'annotation' ? 'annotated' : 'full', evalAttachMode === 'annotation' ? 'annotation' : 'attach');
        }
    
        window.openFinancePdfEditor = () => {
          openPdfEditor('full', 'attach', { returnToReviewPage: true, reviewSource: true });
        };
    
        function closePdfEditor() {
          if (!pdfEditorOverlay) return;
          const shouldReturnToReviewPage = pdfReturnToReviewPage;
          pdfReturnToReviewPage = false;
          pdfReviewSourceMode = false;
          pdfEditorOverlay.classList.remove('open');
          pdfEditorOverlay.setAttribute('aria-hidden', 'true');
          pdfEditorOverlay.classList.remove('annotation-context', 'review-source');
          syncPdfTaskActionLabels();
          setPdfToolbarVisible(false);
          setPdfBottomDockVisible(false);
          exitPdfCompareMode();
          pdfCompareOverlay?.classList.remove('open');
          pdfCompareOverlay?.setAttribute('aria-hidden', 'true');
          pdfCreatePending = false;
          clearPdfDraft();
          if (shouldReturnToReviewPage && evalDetailOverlay) {
            evalDetailOverlay.classList.remove('open');
            evalDetailOverlay.setAttribute('aria-hidden', 'true');
            closeEvalModal();
            closeEvalSupplementOverlay();
            closeEvalPreviewOverlay();
          }
        }
    
        function clearPdfDraft() {
          if (pdfDrawingState?.preview?.parentNode) {
            pdfDrawingState.preview.parentNode.removeChild(pdfDrawingState.preview);
          }
          pdfDrawingState = null;
          document.querySelectorAll('.pdf-paragraph.text-target').forEach(node => node.classList.remove('text-target'));
          pdfDraft = null;
          if (pdfNotePop) pdfNotePop.style.display = 'none';
          pdfNotePop?.classList.remove('centered');
          if (pdfNoteInput) pdfNoteInput.value = '';
          const defaultReplyType = pdfNoteNeedReplyInputs.find(input => input.value === 'no');
          if (defaultReplyType) defaultReplyType.checked = true;
        }
    
        function syncPdfTaskActionLabels() {
          document.querySelectorAll('.pdf-task-actions span:not(.danger)').forEach(node => {
            node.textContent = pdfReviewSourceMode ? '回复' : '编辑';
          });
        }
    
        function positionPdfNotePop(pageNode, anchor) {
          if (!pdfNotePop || !pageNode) return;
          if (anchor.centered) {
            pdfNotePop.classList.add('centered');
            pdfNotePop.style.display = 'block';
            return;
          }
          pdfNotePop.classList.remove('centered');
          const popWidth = 520;
          const popHeight = 240;
          const left = Math.min(Math.max(32, anchor.left), pageNode.clientWidth - popWidth - 32);
          const top = Math.min(Math.max(32, anchor.top), pageNode.clientHeight - popHeight - 32);
          pdfNotePop.style.left = `${left}px`;
          pdfNotePop.style.top = `${top}px`;
          pdfNotePop.style.display = 'block';
        }
    
        function showPdfNotePop(draft) {
          if (!draft || !draft.pageNode) return;
          pdfDraft = draft;
          setPdfToolbarVisible(true);
          positionPdfNotePop(draft.pageNode, draft.anchor);
          if (pdfNoteInput) {
            pdfNoteInput.value = '';
            pdfNoteInput.focus();
          }
        }
    
        function scrollPdfPageIntoView(page) {
          setActivePdfPage(page);
        }
    
        function syncPdfPageChip(page) {
          pdfPageChips.forEach(chip => chip.classList.toggle('active', chip.dataset.pdfPageChip === String(page)));
          if (pdfPageInput) pdfPageInput.value = String(page);
          if (pdfPageTotal) pdfPageTotal.textContent = `/ ${visiblePdfPages().length}`;
        }
    
        function syncPdfPageLinkToggle() {
          if (!pdfPageLinkToggle) return;
          pdfPageLinkToggle.checked = currentPdfContext === 'annotation' && pdfLinkedPages.has(currentPdfPage);
        }
    
        function openPdfLinkConfirm(page) {
          pendingLinkedPage = String(page);
          pdfLinkConfirm?.classList.add('open');
          pdfLinkConfirm?.setAttribute('aria-hidden', 'false');
        }
    
        function closePdfLinkConfirm() {
          pendingLinkedPage = null;
          pdfLinkConfirm?.classList.remove('open');
          pdfLinkConfirm?.setAttribute('aria-hidden', 'true');
          syncPdfPageLinkToggle();
        }
    
        function setActivePdfPage(page) {
          const pages = visiblePdfPages();
          const safeIndex = Math.min(Math.max(1, Number(page) || 1), pages.length);
          currentPdfPage = String(safeIndex);
          pdfPages.forEach(node => node.classList.remove('active'));
          pages[safeIndex - 1]?.classList.add('active');
          syncPdfPageChip(currentPdfPage);
          syncPdfPageLinkToggle();
          if (pdfPagePrev) pdfPagePrev.disabled = currentPdfPage === '1';
          if (pdfPageNext) pdfPageNext.disabled = currentPdfPage === String(pages.length);
          if (pdfPageMinus) pdfPageMinus.disabled = currentPdfPage === '1';
          if (pdfPagePlus) pdfPagePlus.disabled = currentPdfPage === String(pages.length);
        }
    
        function activatePdfAnnotation(id) {
          if (!id) return;
          document.querySelectorAll('.pdf-task-card').forEach(card => card.classList.toggle('active', card.dataset.annotationCard === id));
          document.querySelectorAll('.pdf-annotation-box').forEach(node => node.classList.toggle('active', node.dataset.annotationId === id));
          document.querySelectorAll('.pdf-selectable').forEach(node => node.classList.toggle('active', node.dataset.selectableId === id));
          const target = document.querySelector(`[data-annotation-id="${id}"], [data-selectable-id="${id}"]`);
          const card = document.querySelector(`[data-annotation-card="${id}"]`);
          const page = target?.dataset.page || target?.closest('[data-pdf-page]')?.dataset.pdfPage;
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          if (target) {
            if (page) {
              const pages = visiblePdfPages();
              const index = pages.findIndex(node => node.dataset.pdfPage === String(page));
              if (index >= 0) setActivePdfPage(String(index + 1));
            }
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 140);
          }
        }
    
        function bindPdfTaskCard(card) {
          if (!card) return;
          const actionButtons = card.querySelectorAll('.pdf-task-actions span');
          actionButtons.forEach(btn => {
            btn.addEventListener('click', event => {
              event.stopPropagation();
            });
          });
          bindDiscussionCard(card);
        }
    
        function bindDiscussionCard(card) {
          if (!card || card.dataset.discussionBound === '1') return;
          card.dataset.discussionBound = '1';
    
          const toggle = card.querySelector('.pdf-discussion-toggle');
          const composer = card.querySelector('[data-discussion-composer]');
          const textarea = composer?.querySelector('textarea');
          const addBtn = card.querySelector('[data-discussion-add]');
          const replyBtn = card.querySelector('[data-discussion-reply]');
          const cancelBtn = card.querySelector('[data-discussion-cancel]');
          const sendBtn = card.querySelector('[data-discussion-send]');
          const stateText = card.querySelector('.pdf-discussion-empty');
    
          function closeComposer() {
            composer?.classList.remove('active');
            if (textarea) textarea.value = '';
            if (composer) delete composer.dataset.mode;
            if (stateText) stateText.textContent = '';
          }
    
          function openComposer(mode) {
            if (!composer || !textarea) return;
            composer.classList.add('active');
            composer.dataset.mode = mode;
            textarea.placeholder = mode === 'reply' ? '请输入回复内容' : '请输入建议内容';
            if (stateText) stateText.textContent = mode === 'reply' ? '回复最近一轮建议' : '新增一轮建议';
            textarea.focus();
          }
    
          toggle?.addEventListener('click', event => {
            event.stopPropagation();
            const expanded = card.classList.toggle('discussion-expanded');
            toggle.textContent = expanded
              ? (toggle.dataset.collapseText || '收起更早讨论')
              : (toggle.dataset.expandText || '展开更早讨论');
          });
    
          addBtn?.addEventListener('click', event => {
            event.stopPropagation();
            openComposer('suggestion');
          });
    
          replyBtn?.addEventListener('click', event => {
            event.stopPropagation();
            openComposer('reply');
          });
    
          cancelBtn?.addEventListener('click', event => {
            event.stopPropagation();
            closeComposer();
          });
    
          sendBtn?.addEventListener('click', event => {
            event.stopPropagation();
            if (!composer || !textarea) return;
            const value = textarea.value.trim();
            if (!value) return;
            const latest = card.querySelector('.pdf-discussion-latest');
            const latestRound = latest?.querySelector('.pdf-discussion-round');
            if (!latest || !latestRound) return;
    
            if (composer.dataset.mode === 'reply') {
              latestRound.querySelector('.pdf-discussion-pending')?.remove();
              const reply = document.createElement('div');
              reply.className = 'pdf-discussion-message reply';
              reply.innerHTML = `
                <div class="pdf-discussion-head">创建人 · 回复 · 2026-05-15 18:40</div>
                <div class="pdf-discussion-body"></div>
              `;
              reply.querySelector('.pdf-discussion-body').textContent = value;
              latestRound.appendChild(reply);
            } else {
              latest.innerHTML = `
                <div class="pdf-discussion-round">
                  <div class="pdf-discussion-message suggestion">
                    <div class="pdf-discussion-head">新增建议 · 2026-05-15 18:30</div>
                    <div class="pdf-discussion-body"></div>
                  </div>
                  <div class="pdf-discussion-pending">等待创建人回复</div>
                </div>
              `;
              latest.querySelector('.pdf-discussion-body').textContent = value;
            }
    
            closeComposer();
          });
        }
    
        function buildPdfTaskCard({ id, title, page, type, note, needReply = false }) {
          const card = document.createElement('article');
          card.className = 'pdf-task-card';
          card.dataset.annotationCard = id;
          card.innerHTML = `
            <div class="pdf-task-top">
              <div class="pdf-task-tags">
                <span class="pdf-tag page">第${page}页</span>
                <span class="pdf-tag type">${type === 'area' ? '框选批注' : '文字选择'}</span>
                ${needReply ? '<span class="pdf-tag thread">需协同回复</span>' : ''}
              </div>
            </div>
            <div class="pdf-task-main">${note}</div>
            <div class="pdf-task-foot">
              <div class="pdf-task-meta">系统预置  2026-05-13 10:20</div>
              <div class="pdf-task-actions"><span>编辑</span><span class="danger">删除</span></div>
            </div>
          `;
          pdfTaskList?.prepend(card);
          card.addEventListener('click', () => activatePdfAnnotation(id));
          bindPdfTaskCard(card);
          return card;
        }
    
        function visiblePdfPages() {
          if (currentPdfScope === 'unannotated') {
            return pdfPages.filter(page => !(page.dataset.pdfScope || 'full').includes('annotated'));
          }
          return pdfPages.filter(page => (page.dataset.pdfScope || 'full').includes(currentPdfScope));
        }
    
        function savePdfDraft() {
          const note = pdfNoteInput?.value.trim();
          if (!pdfDraft || !note) return;
          const needReply = pdfNoteNeedReplyInputs.some(input => input.checked && input.value === 'yes');
          const id = pdfDraft.id || `${pdfDraft.type}-${pdfAnnotationSeed++}`;
          let targetNode = null;
    
          if (pdfDraft.type === 'area') {
            targetNode = document.createElement('div');
            targetNode.className = 'pdf-annotation-box';
            targetNode.dataset.annotationId = id;
            targetNode.dataset.page = pdfDraft.page;
            targetNode.style.left = `${pdfDraft.rect.left}px`;
            targetNode.style.top = `${pdfDraft.rect.top}px`;
            targetNode.style.width = `${pdfDraft.rect.width}px`;
            targetNode.style.height = `${pdfDraft.rect.height}px`;
            pdfDraft.pageNode.appendChild(targetNode);
          } else if (pdfDraft.type === 'text') {
            targetNode = pdfDraft.target;
            targetNode.dataset.selectableId = id;
            targetNode.classList.add('annotated');
          }
    
          if (!targetNode) return;
          buildPdfTaskCard({
            id,
            page: pdfDraft.page,
            type: pdfDraft.type,
            note,
            needReply
          });
          targetNode.addEventListener('click', event => {
            event.stopPropagation();
            activatePdfAnnotation(id);
          });
          pdfCreatePending = false;
          clearPdfDraft();
          activatePdfAnnotation(id);
        }
    
        function handlePdfAreaStart(event) {
          if (!pdfToolbarVisible || !pdfCreatePending || pdfMode !== 'area') return;
          const canvas = event.currentTarget;
          const pageNode = canvas.closest('[data-pdf-page]');
          if (!pageNode) return;
          const pageRect = pageNode.getBoundingClientRect();
          const left = event.clientX - pageRect.left;
          const top = event.clientY - pageRect.top;
          const preview = document.createElement('div');
          preview.className = 'pdf-drawing-box';
          preview.style.left = `${left}px`;
          preview.style.top = `${top}px`;
          preview.style.width = '0px';
          preview.style.height = '0px';
          pageNode.appendChild(preview);
          pdfDrawingState = {
            pageNode,
            page: pageNode.dataset.pdfPage,
            startX: left,
            startY: top,
            preview
          };
        }
    
        function handlePdfAreaMove(event) {
          if (!pdfDrawingState || !pdfToolbarVisible || pdfMode !== 'area') return;
          const rect = pdfDrawingState.pageNode.getBoundingClientRect();
          const currentX = event.clientX - rect.left;
          const currentY = event.clientY - rect.top;
          const left = Math.min(pdfDrawingState.startX, currentX);
          const top = Math.min(pdfDrawingState.startY, currentY);
          const width = Math.abs(currentX - pdfDrawingState.startX);
          const height = Math.abs(currentY - pdfDrawingState.startY);
          Object.assign(pdfDrawingState.preview.style, {
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`
          });
        }
    
        function handlePdfAreaEnd() {
          if (!pdfDrawingState || !pdfToolbarVisible || pdfMode !== 'area') return;
          const { preview, pageNode, page } = pdfDrawingState;
          const width = parseFloat(preview.style.width || '0');
          const height = parseFloat(preview.style.height || '0');
          if (width < 24 || height < 24) {
            clearPdfDraft();
            return;
          }
          showPdfNotePop({
            type: 'area',
            pageNode,
            page,
            rect: {
              left: parseFloat(preview.style.left || '0'),
              top: parseFloat(preview.style.top || '0'),
              width,
              height
            },
            anchor: {
              left: parseFloat(preview.style.left || '0') + width + 18,
              top: parseFloat(preview.style.top || '0') + 6
            }
          });
          preview.parentNode?.removeChild(preview);
          pdfDrawingState = null;
        }
    
        tabs.forEach(tab => {
          tab.addEventListener('click', () => activateTab(tab.dataset.tab));
        });
    
        progressSteps.forEach(step => {
          step.addEventListener('click', () => activateProgressStep(step.dataset.step));
        });
    
        evalHomeTabs.forEach(tab => {
          tab.addEventListener('click', () => activateEvalHomeTab(tab.dataset.evalHomeTab));
        });
    
        auditTabs.forEach(tab => {
          tab.addEventListener('click', () => activateAuditTab(tab.dataset.auditTab));
        });
    
        auditMinutesOpeners.forEach(button => {
          button.addEventListener('click', openAuditMinutesDrawer);
        });
        auditMinutesClose?.addEventListener('click', closeAuditMinutesDrawer);
        auditMinutesMask?.addEventListener('click', closeAuditMinutesDrawer);
    
        evalDetailTabs.forEach(tab => {
          tab.addEventListener('click', () => activateEvalDetailTab(tab.dataset.evalDetailTab));
        });
    
        evalOpeners.forEach(opener => {
          opener.addEventListener('click', () => openEvalDetail('execute'));
        });
    
        evalPrevNext.forEach(button => {
          button.addEventListener('click', () => {
            if (button.dataset.evalNext) activateEvalDetailTab(button.dataset.evalNext);
            if (button.dataset.evalPrev) activateEvalDetailTab(button.dataset.evalPrev);
          });
        });
    
        evalModalOpeners.forEach(button => {
          button.addEventListener('click', () => openEvalModal(button.dataset.openEvalModal));
        });
    
        evalModalClosers.forEach(button => {
          button.addEventListener('click', closeEvalModal);
        });
    
        openEvalSupplement?.addEventListener('click', openEvalSupplementOverlay);
        closeEvalSupplement?.addEventListener('click', closeEvalSupplementOverlay);
        saveEvalSupplement?.addEventListener('click', closeEvalSupplementOverlay);
        openEvalPreview?.addEventListener('click', openEvalPreviewOverlay);
        closeEvalPreview?.addEventListener('click', closeEvalPreviewOverlay);
    
        function bindBottomDockFileActions() {
          pdfBottomFileOpeners().forEach(button => {
            if (button.dataset.bound === '1') return;
            button.dataset.bound = '1';
            button.addEventListener('click', () => openPdfEditor(currentPdfContext === 'annotation' ? 'annotated' : 'full', currentPdfContext));
          });
    
          pdfBottomCompareButtons().forEach(button => {
            if (button.dataset.bound === '1') return;
            button.dataset.bound = '1';
            button.addEventListener('click', event => {
              event.stopPropagation();
              openPdfCompareDrawer();
            });
          });
        }
    
        pdfFileOpeners.forEach(button => {
          button.addEventListener('click', () => openPdfEditorFromFileTrigger(button));
        });
    
        document.addEventListener('click', event => {
          const trigger = event.target.closest('[data-open-pdf-editor]');
          if (!trigger) return;
          event.preventDefault();
          event.stopPropagation();
          openPdfEditorFromFileTrigger(trigger);
        });
    
        document.addEventListener('click', event => {
          const trigger = event.target.closest('[data-open-main-pdf]');
          if (!trigger) return;
          event.preventDefault();
          event.stopPropagation();
          openPdfEditor('full', 'attach');
        });
    
        evalAnnotationOpeners.forEach(button => {
          button.addEventListener('click', () => openPdfEditor('annotated', 'annotation'));
        });
    
        evalAttachMeta?.addEventListener('click', event => {
          const trigger = event.target.closest('[data-open-main-pdf]');
          if (!trigger) return;
          event.stopPropagation();
          openPdfEditor('full', 'attach');
        });
    
        evalAttachTable?.querySelectorAll('tbody tr').forEach((row, index) => {
          row.dataset.attachId = String(index + 1);
          const trigger = row.querySelector('.topic-check');
          trigger?.addEventListener('click', event => {
            event.stopPropagation();
            toggleAttachSelection(row);
          });
          row.addEventListener('click', event => {
            if (event.target.closest('.pdf-file-link')) return;
            if (event.target.closest('.danger')) return;
            if (event.target.closest('.topic-check')) return;
            toggleAttachSelection(row);
          });
        });
    
        pdfModeButtons.forEach(button => {
          button.addEventListener('click', () => {
            const mode = button.dataset.pdfMode;
            if (currentPdfContext === 'annotation') {
              setPdfToolbarVisible(true);
              setPdfMode(mode);
              pdfCreatePending = mode === 'new';
              return;
            }
            setPdfMode(mode);
          });
        });
    
        pdfPageChips.forEach(chip => {
          chip.addEventListener('click', () => {
            setActivePdfPage(chip.dataset.pdfPageChip);
          });
        });
    
        pdfPagePrev?.addEventListener('click', () => {
          const prev = Math.max(1, Number(currentPdfPage) - 1);
          setActivePdfPage(String(prev));
        });
    
        pdfPageNext?.addEventListener('click', () => {
          const next = Math.min(visiblePdfPages().length, Number(currentPdfPage) + 1);
          setActivePdfPage(String(next));
        });
    
        pdfPageMinus?.addEventListener('click', () => {
          const prev = Math.max(1, Number(currentPdfPage) - 1);
          setActivePdfPage(String(prev));
        });
    
        pdfPagePlus?.addEventListener('click', () => {
          const next = Math.min(visiblePdfPages().length, Number(currentPdfPage) + 1);
          setActivePdfPage(String(next));
        });
    
        pdfPageInput?.addEventListener('change', () => {
          const page = Math.min(visiblePdfPages().length, Math.max(1, Number(pdfPageInput.value.replace(/\D/g, '')) || 1));
          setActivePdfPage(String(page));
        });
    
        pdfPageLinkToggle?.addEventListener('change', () => {
          if (currentPdfContext !== 'annotation') return;
          if (pdfPageLinkToggle.checked) {
            pdfPageLinkToggle.checked = false;
            openPdfLinkConfirm(currentPdfPage);
          } else {
            pdfLinkedPages.delete(currentPdfPage);
          }
        });
    
        pdfLinkConfirmOk?.addEventListener('click', () => {
          if (pendingLinkedPage) {
            pdfLinkedPages.add(pendingLinkedPage);
          }
          closePdfLinkConfirm();
          syncPdfPageLinkToggle();
        });
    
        pdfLinkConfirmCancel?.addEventListener('click', closePdfLinkConfirm);
    
        pdfLinkConfirm?.addEventListener('click', event => {
          if (event.target === pdfLinkConfirm) closePdfLinkConfirm();
        });
    
        pdfCanvasList.forEach(canvas => {
          canvas.addEventListener('mousedown', handlePdfAreaStart);
          canvas.addEventListener('mousemove', handlePdfAreaMove);
          canvas.addEventListener('mouseup', handlePdfAreaEnd);
          canvas.addEventListener('mouseleave', () => {
            if (pdfDrawingState?.preview && pdfMode === 'area') handlePdfAreaEnd();
          });
        });
    
        document.querySelectorAll('.pdf-annotation-box').forEach(node => {
          node.addEventListener('click', event => {
            event.stopPropagation();
            activatePdfAnnotation(node.dataset.annotationId);
          });
        });
    
        document.querySelectorAll('.pdf-selectable').forEach(node => {
          if (node.dataset.selectableId && !node.dataset.noHighlight) node.classList.add('annotated');
          node.addEventListener('click', event => {
            event.stopPropagation();
            if (pdfToolbarVisible && pdfCreatePending && (pdfMode === 'text' || pdfMode === 'new')) {
              const pageNode = node.closest('[data-pdf-page]');
              showPdfNotePop({
                type: 'text',
                pageNode,
                page: pageNode.dataset.pdfPage,
                target: node,
                anchor: {
                  centered: true
                }
              });
              node.classList.add('active');
              return;
            }
            if (node.dataset.selectableId) activatePdfAnnotation(node.dataset.selectableId);
          });
        });
    
        document.querySelectorAll('.pdf-paragraph').forEach(node => {
          node.addEventListener('click', event => {
            if (event.target.closest('.pdf-selectable')) return;
            if (!(pdfToolbarVisible && pdfCreatePending && (pdfMode === 'text' || pdfMode === 'new'))) return;
            event.stopPropagation();
            const pageNode = node.closest('[data-pdf-page]');
            node.classList.add('text-target');
            showPdfNotePop({
              type: 'text',
              pageNode,
              page: pageNode.dataset.pdfPage,
              target: node,
              anchor: {
                centered: true
              }
            });
          });
        });
    
        document.querySelectorAll('.pdf-page').forEach(pageNode => {
          pageNode.addEventListener('mouseup', event => {
            if (!(pdfToolbarVisible && pdfCreatePending && (pdfMode === 'text' || pdfMode === 'new'))) return;
            if (pdfNotePop?.style.display === 'block') return;
            if (event.target.closest('.pdf-selectable')) return;
            const selectedText = (window.getSelection?.().toString() || '').trim();
            if (!selectedText) return;
            const paragraph = event.target.closest('.pdf-paragraph');
            if (!paragraph) return;
            paragraph.classList.add('text-target');
            showPdfNotePop({
              type: 'text',
              pageNode,
              page: pageNode.dataset.pdfPage,
              target: paragraph,
              anchor: {
                centered: true
              }
            });
          });
        });
    
        pdfTaskCards().forEach(card => {
          card.addEventListener('click', () => activatePdfAnnotation(card.dataset.annotationCard));
          bindPdfTaskCard(card);
        });
    
        pdfFileSwitch?.addEventListener('change', () => {
          currentPdfFile = pdfFileSwitch.value;
          setActivePdfPage('1');
          activatePdfAnnotation('area-1');
        });
    
        pdfTaskAdd?.addEventListener('click', () => {
          setPdfToolbarVisible(true);
          pdfCreatePending = true;
          if (pdfMode === 'area') {
            pdfToolbarHint.textContent = '拖动鼠标绘制矩形区域';
          } else {
            pdfToolbarHint.textContent = '点击正文高亮文本后填写说明';
          }
        });
    
        pdfEditorOverlay?.addEventListener('mousemove', event => {
          if (!pdfEditorOverlay.classList.contains('open')) return;
          if (pdfCompareMode) return;
          const rect = pdfEditorOverlay.getBoundingClientRect();
          const nearBottom = event.clientY >= rect.bottom - 220;
          setPdfBottomDockVisible(nearBottom);
        });
    
        pdfEditorOverlay?.addEventListener('mouseleave', () => {
          setPdfBottomDockVisible(false);
        });
    
        pdfBottomDock?.addEventListener('mouseenter', () => {
          if (pdfCompareMode) return;
          setPdfBottomDockVisible(true);
        });
    
        pdfBottomDock?.addEventListener('mouseleave', () => {
          setPdfBottomDockVisible(false);
        });
    
        pdfProposalSelect?.addEventListener('change', syncPdfProposalPanel);
    
        pdfCompareMask?.addEventListener('click', () => {
          pdfCompareOverlay?.classList.remove('open');
          pdfCompareOverlay?.setAttribute('aria-hidden', 'true');
        });
    
        pdfCompareClose?.addEventListener('click', () => {
          pdfCompareOverlay?.classList.remove('open');
          pdfCompareOverlay?.setAttribute('aria-hidden', 'true');
        });
    
        pdfCompareInlineBack?.addEventListener('click', exitPdfCompareMode);
    
        document.querySelectorAll('[data-compare-prev], [data-compare-next], [data-compare-minus], [data-compare-plus]').forEach(button => {
          button.addEventListener('click', () => {
            const id = button.dataset.comparePrev || button.dataset.compareNext || button.dataset.compareMinus || button.dataset.comparePlus;
            const delta = button.dataset.comparePrev || button.dataset.compareMinus ? -1 : 1;
            comparePagerState[id] = Math.min(10, Math.max(1, (comparePagerState[id] || 1) + delta));
            syncComparePager(id);
          });
        });
    
        document.querySelectorAll('[data-compare-input]').forEach(input => {
          input.addEventListener('change', () => {
            const id = input.dataset.compareInput;
            comparePagerState[id] = Math.min(10, Math.max(1, Number(input.value.replace(/\\D/g, '')) || 1));
            syncComparePager(id);
          });
        });
    
        document.querySelectorAll('.pdf-compare-drawer .pdf-task-actions span').forEach(node => {
          node.addEventListener('click', event => event.stopPropagation());
        });
    
        pdfNoteSave?.addEventListener('click', savePdfDraft);
        pdfNoteCancel?.addEventListener('click', clearPdfDraft);
        pdfEditorBack?.addEventListener('click', closePdfEditor);
        pdfToolbarCancel?.addEventListener('click', () => {
          clearPdfDraft();
          pdfCreatePending = false;
          if (currentPdfContext === 'annotation') {
            setPdfToolbarVisible(true);
            setPdfMode('existing');
          } else {
            setPdfToolbarVisible(false);
            setPdfMode('area');
          }
        });
    
        evalAttachConfirm?.addEventListener('click', () => {
          if (evalAttachMode === 'attach') {
            evalAttachLinked = evalAttachSelected.size > 0;
            syncAttachTrigger();
            updateAttachMeta();
          }
        });
    
        openTopicAdd?.addEventListener('click', openTopicAddDrawer);
        closeTopicAdd?.addEventListener('click', closeTopicAddDrawer);
        topicAddMask?.addEventListener('click', closeTopicAddDrawer);
        saveTopicAdd?.addEventListener('click', closeTopicAddDrawer);
        evalDetailClose?.addEventListener('click', closeEvalDetail);
        evalDetailMask?.addEventListener('click', closeEvalDetail);
        roleButtons.forEach(button => {
          button.addEventListener('click', () => activateRole(button.dataset.role));
        });
    
        window.addEventListener('keydown', event => {
          if (event.key === 'Escape') closeTopicAddDrawer();
          if (event.key === 'Escape') closeEvalDetail();
          if (event.key === 'Escape') closeEvalModal();
          if (event.key === 'Escape') closeEvalSupplementOverlay();
          if (event.key === 'Escape') closeEvalPreviewOverlay();
          if (event.key === 'Escape') closePdfEditor();
        });
    
        window.addEventListener('resize', scaleViewport);
        bindBottomDockFileActions();
        if (window.location.hash) {
          const hashStep = window.location.hash.slice(1);
          if (progressSteps.some(step => step.dataset.step === hashStep)) {
            activateProgressStep(hashStep);
          }
        }
        syncAttachTrigger();
        syncAttachSelectionUI();
        updateAttachMeta();
        scaleViewport();

    return () => {
      document.body.classList.remove("role-finance", "role-legal");
    };
  }, []);

  return (
    <>
      <div className="viewport" id="viewport">
          <div className="workspace">
            <div className="topbar">
              <div className="brand-mark"></div>
              <div className="brand-text">一汽云工作台</div>
              <div className="role-switcher" aria-label="角色切换">
                <button className="role-btn active" data-role="manager" type="button">管户</button>
                <button className="role-btn" data-role="finance" type="button">财务</button>
                <button className="role-btn" data-role="legal" type="button">法务</button>
              </div>
              <div className="home-link">⌂ 首页</div>
            </div>
            <aside className="left-menu">
              <div className="left-title">股权投资</div>
              <div className="menu-item">我的收藏</div>
              <div className="menu-item">议题PDF</div>
              <div className="menu-item">资产巡检</div>
              <div className="menu-item">资产维修</div>
              <div className="menu-item">风险管理</div>
              <div className="menu-item">股权退出流程</div>
              <div className="menu-item">资产盘活</div>
              <div className="menu-item">闲废资产处置</div>
              <div className="menu-item">运营监控</div>
              <div className="menu-item">股票减持管理</div>
              <div className="menu-item">股权经营项目</div>
              <div className="menu-item">资产接收</div>
              <div className="menu-item">股权投资</div>
              <div className="menu-item">战略规划</div>
              <div className="menu-item active">股权运营</div>
            </aside>
            <section className="ghost-area">
              <div className="ghost-tab">高选聘 <span>×</span></div>
              <div className="ghost-heading">参股公司统</div>
              <div className="ghost-input"></div>
              <div className="ghost-table">
                <div><strong>序号</strong></div>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
                <div>10</div>
              </div>
            </section>
            <div className="side-collapse">‹</div>
            <div className="bottom-scroll"></div>
          </div>
      
          <div className="scrim"></div>
      
          <main className="drawer" id="drawer">
            <header className="drawer-head">
              <div className="close"></div>
              <div className="drawer-title" id="drawer-title">议题提报</div>
              <div className="head-sep"></div>
              <div className="company-code">202600035</div>
              <div className="company-name">长春富维集团汽车零部件股份有限公司</div>
              <div className="stage-pill" id="stage-pill">议题提报中</div>
            </header>
      
            <section className="progress-shell" aria-label="三会流程进度">
              <div className="progress">
                <button className="progress-step active" data-step="submit" type="button">
                  <span className="circle">1</span>
                  <span className="label">议题提报</span>
                </button>
                <button className="progress-step" data-step="evaluate" type="button">
                  <span className="circle">2</span>
                  <span className="label">议题评估</span>
                </button>
                <button className="progress-step" data-step="audit" type="button">
                  <span className="circle">3</span>
                  <span className="label">议题审核</span>
                </button>
                <button className="progress-step" data-step="advice" type="button">
                  <span className="circle">4</span>
                  <span className="label">表决建议</span>
                </button>
                <button className="progress-step" data-step="vote" type="button">
                  <span className="circle">5</span>
                  <span className="label">三会表决</span>
                </button>
                <button className="progress-step" data-step="execute" type="button">
                  <span className="circle">6</span>
                  <span className="label">决策执行</span>
                </button>
                <button className="progress-step" data-step="finish" type="button">
                  <span className="circle">7</span>
                  <span className="label">结束</span>
                </button>
              </div>
            </section>
      
            <nav className="sub-tabs" aria-label="议题提报页签">
              <button className="sub-tab ai active" data-tab="ai"><span className="ai-logo">Ai</span>智能识别</button>
              <button className="sub-tab" data-tab="topics"><span className="stack-icon"></span>议题管理</button>
              <button className="sub-tab" data-tab="meetings"><span className="people-icon"><span></span></span>会议管理</button>
              <button className="sub-tab" data-tab="materials"><span className="doc-icon"></span>议题资料传达</button>
            </nav>
      
            <section className="panel active" data-panel="ai">
              <div className="ai-summary">
                <div className="ai-stage"></div>
                <div className="upload-box">
                  <div className="upload-icon"><span className="upload-tray"></span></div>
                  <div className="upload-copy">点击或将文件拖拽到这里上传</div>
                  <div className="upload-note"><span className="warn-icon"></span>请上传提报文档，AI将会提取信息为您自动创建议题以及会议数据！</div>
                </div>
              </div>
              <div className="ai-table-shell">
                <table className="data-table file-table">
                  <colgroup><col /><col /><col /><col /><col /><col /></colgroup>
                  <thead>
                    <tr>
                      <th>序号</th>
                      <th>文件名</th>
                      <th>文件分类</th>
                      <th>AI处理状态</th>
                      <th>AI提取结果</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="center">1</td>
                      <td className="blue-link">1.招标文件-备注版-明阳智能AI在多业务<br />域应用试点项目-20250606.docx</td>
                      <td><div className="fake-select">议题相关<span className="chev"></span></div></td>
                      <td>解析完成</td>
                      <td>已提取到关键信息并创建了1<br />个议题</td>
                      <td><div className="row-actions"><span className="row-action">上移</span><span className="row-action">下移</span><span className="row-action danger">删除</span></div></td>
                    </tr>
                    <tr>
                      <td className="center">2</td>
                      <td className="blue-link">1.png</td>
                      <td><div className="fake-select">议题相关<span className="chev"></span></div></td>
                      <td>解析完成</td>
                      <td>已提取到关键信息并创建了1<br />个议题</td>
                      <td><div className="row-actions"><span className="row-action">上移</span><span className="row-action">下移</span><span className="row-action danger">删除</span></div></td>
                    </tr>
                    <tr>
                      <td className="center">3</td>
                      <td className="blue-link">1.招标文件-备注版-明阳智能AI在多业务<br />域应用试点项目-20250606.docx</td>
                      <td><div className="fake-select">议题相关<span className="chev"></span></div></td>
                      <td>解析完成</td>
                      <td>已提取到关键信息并创建了1<br />个议题</td>
                      <td><div className="row-actions"><span className="row-action">上移</span><span className="row-action">下移</span><span className="row-action danger">删除</span></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
      
            <section className="panel" data-panel="topics">
              <div className="filter-row">
                <div className="filter-block">
                  <label>议题分类（大）</label>
                  <div className="fake-select placeholder">请选择<span className="chev"></span></div>
                </div>
                <div className="filter-block">
                  <label>议题分类（中）</label>
                  <div className="fake-select placeholder">请选择<span className="chev"></span></div>
                </div>
                <div className="filter-block">
                  <label>议题分类（小）</label>
                  <div className="fake-select placeholder">请选择<span className="chev"></span></div>
                </div>
                <div className="filter-block">
                  <label>审批层级</label>
                  <div className="fake-select placeholder">请选择<span className="chev"></span></div>
                </div>
              </div>
              <div className="search-actions">
                <button className="small-btn">重置</button>
                <button className="small-btn primary">搜索</button>
              </div>
              <button className="add-btn" id="open-topic-add" type="button">新增</button>
              <table className="data-table topic-table">
                <colgroup><col /><col /><col /><col /><col /><col /><col /><col /><col /><col /></colgroup>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>议题分类（大）</th>
                    <th>议题分类（中）</th>
                    <th>议题分类（小）</th>
                    <th>议题名称</th>
                    <th>董事会</th>
                    <th>监事会</th>
                    <th>股东会</th>
                    <th>审批层级</th>
                    <th>操作</th>
                  </tr>
                </thead>
              </table>
              <div className="empty-state">
                <div className="empty-icon"></div>
                <div>暂无数据</div>
              </div>
            </section>
      
            <section className="topic-add-overlay" id="topic-add-overlay" aria-hidden="true">
              <div className="topic-add-mask"></div>
              <div className="topic-add-drawer">
                <div className="topic-add-head">
                  <button className="topic-add-close" id="close-topic-add" type="button" aria-label="关闭新增议题"></button>
                  <div className="topic-add-title">新增议题</div>
                </div>
                <div className="topic-add-body">
                  <div className="topic-add-form">
                    <div className="topic-add-row topic-row-first">
                      <div className="topic-field">
                        <label className="topic-required">议题名称</label>
                        <div className="topic-input placeholder">请输入</div>
                      </div>
                      <div className="topic-field">
                        <label className="topic-required">前序审核</label>
                        <div className="topic-inline-box">
                          <div className="topic-radio-row">
                            <span className="topic-radio active"><span className="topic-radio-dot"></span>有</span>
                            <span className="topic-radio"><span className="topic-radio-dot"></span>无</span>
                          </div>
                        </div>
                      </div>
                      <div className="topic-field">
                        <label className="topic-required">计划议题</label>
                        <div className="topic-inline-box">
                          <div className="topic-radio-row">
                            <span className="topic-radio"><span className="topic-radio-dot"></span>是</span>
                            <span className="topic-radio active"><span className="topic-radio-dot"></span>否</span>
                          </div>
                        </div>
                      </div>
                      <div className="topic-field">
                        <label>关联计划议题（以备证计划议题被提报）</label>
                        <div className="topic-search placeholder"><span>请选择关联的计划议题</span><span className="topic-search-icon"></span></div>
                      </div>
                    </div>
      
                    <div className="topic-add-row topic-row-second">
                      <div className="topic-field">
                        <label className="topic-required">议题分类（大）</label>
                        <div className="topic-select placeholder">请选择<span className="chev"></span></div>
                      </div>
                      <div className="topic-field">
                        <label className="topic-required">议题分类（中）</label>
                        <div className="topic-select placeholder">请选择<span className="chev"></span></div>
                      </div>
                      <div className="topic-field">
                        <label className="topic-required">议题分类（小）</label>
                        <div className="topic-select placeholder">请选择<span className="chev"></span></div>
                      </div>
                      <div className="topic-field">
                        <label className="topic-required">审批层级</label>
                        <div className="topic-select placeholder">请选择<span className="chev"></span></div>
                      </div>
                    </div>
      
                    <div className="topic-add-row topic-row-third">
                      <div className="topic-field">
                        <label className="topic-required">参会审议</label>
                        <div className="topic-inline-box toggle-box">
                          <div className="topic-segmented">
                            <div className="topic-segment active"><span className="topic-segment-switch"></span><span>董事会</span></div>
                            <div className="topic-segment"><span className="topic-segment-switch"></span><span>监事会</span></div>
                            <div className="topic-segment active"><span className="topic-segment-switch"></span><span>股东会</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="topic-field">
                        <label>回避表决</label>
                        <div className="topic-inline-box toggle-box">
                          <div className="topic-segmented">
                            <div className="topic-segment"><span className="topic-segment-switch"></span><span>董事会</span></div>
                            <div className="topic-segment active"><span className="topic-segment-switch"></span><span>监事会</span></div>
                            <div className="topic-segment active"><span className="topic-segment-switch"></span><span>股东会</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
      
                    <div className="topic-add-row topic-row-fourth">
                      <div className="topic-field">
                        <label>议题简介</label>
                        <div className="topic-textarea placeholder">请输入</div>
                      </div>
                    </div>
      
                    <div className="topic-attach-block">
                      <div className="topic-attach-head">
                        <div className="topic-attach-header">相关附件</div>
                        <div className="notice topic-attach-note"><span className="warn-icon"></span>AI已经帮您选择了认为相关的文档，如有遗漏请补充选择！</div>
                      </div>
                      <table className="data-table topic-attach-table">
                        <colgroup><col /><col /><col /><col /></colgroup>
                        <thead>
                          <tr>
                            <th><span className="topic-check"></span></th>
                            <th>序号</th>
                            <th>文件名</th>
                            <th>文件分类</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span className="topic-check"></span></td>
                            <td className="center">1</td>
                            <td>1.png</td>
                            <td>议题相关</td>
                          </tr>
                          <tr>
                            <td><span className="topic-check"></span></td>
                            <td className="center">2</td>
                            <td>1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</td>
                            <td>议题相关</td>
                          </tr>
                          <tr>
                            <td><span className="topic-check"></span></td>
                            <td className="center">3</td>
                            <td>20250428中联电子议题关键信息页(1).pdf</td>
                            <td>议题相关</td>
                          </tr>
                          <tr>
                            <td><span className="topic-check"></span></td>
                            <td className="center">4</td>
                            <td>20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</td>
                            <td>议题相关</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
      
                    <div className="topic-add-foot">
                      <button className="foot-btn primary wide" type="button">补充汇报材料</button>
                      <button className="foot-btn" type="button">预览</button>
                      <button className="foot-btn primary" id="save-topic-add" type="button">保存</button>
                    </div>
                  </div>
                  <div className="topic-add-scrollbar"></div>
                </div>
              </div>
            </section>
      
            <section className="panel" data-panel="meetings">
              <div className="meeting-grid">
                <div className="meeting-card">
                  <div className="meeting-head">董事会 <span className="switch-line"><span className="switch"></span>召开</span></div>
                  <div className="meeting-field name required">
                    <label>会议名称</label>
                    <div className="input">请输入</div>
                  </div>
                  <div className="meeting-field notify required">
                    <label>通知时间</label>
                    <div className="input calendar">请选择日期</div>
                  </div>
                  <div className="meeting-field method required">
                    <label>召开方式</label>
                    <div className="radio-row">
                      <div className="radio-item"><span className="radio checked"></span>现场会议</div>
                      <div className="radio-item"><span className="radio"></span>通讯表决</div>
                    </div>
                  </div>
                  <div className="meeting-field time required">
                    <label>会议时间</label>
                    <div className="input calendar">请选择日期</div>
                  </div>
                  <div className="meeting-field place">
                    <label>会议地点</label>
                    <div className="input">请输入</div>
                  </div>
                </div>
                <div className="meeting-card">
                  <div className="meeting-head">监事会 <span className="switch-line"><span className="switch"></span>召开</span></div>
                  <div className="meeting-field name required">
                    <label>会议名称</label>
                    <div className="input">请输入</div>
                  </div>
                  <div className="meeting-field notify required">
                    <label>通知时间</label>
                    <div className="input calendar">请选择日期</div>
                  </div>
                  <div className="meeting-field method required">
                    <label>召开方式</label>
                    <div className="radio-row">
                      <div className="radio-item"><span className="radio checked"></span>现场会议</div>
                      <div className="radio-item"><span className="radio"></span>通讯表决</div>
                    </div>
                  </div>
                  <div className="meeting-field time required">
                    <label>会议时间</label>
                    <div className="input calendar">请选择日期</div>
                  </div>
                  <div className="meeting-field place">
                    <label>会议地点</label>
                    <div className="input">请输入</div>
                  </div>
                </div>
                <div className="meeting-card">
                  <div className="meeting-head">股东会 <span className="switch-line"><span className="switch"></span>召开</span></div>
                  <div className="meeting-field name required">
                    <label>会议名称</label>
                    <div className="input">请输入</div>
                  </div>
                  <div className="meeting-field notify required">
                    <label>通知时间</label>
                    <div className="input calendar">请选择日期</div>
                  </div>
                  <div className="meeting-field method required">
                    <label>召开方式</label>
                    <div className="radio-row">
                      <div className="radio-item"><span className="radio checked"></span>现场会议</div>
                      <div className="radio-item"><span className="radio"></span>通讯表决</div>
                    </div>
                  </div>
                  <div className="meeting-field time required">
                    <label>会议时间</label>
                    <div className="input calendar">请选择日期</div>
                  </div>
                  <div className="meeting-field place">
                    <label>会议地点</label>
                    <div className="input">请输入</div>
                  </div>
                </div>
              </div>
            </section>
      
            <section className="panel materials" data-panel="materials">
              <div className="materials-layout">
                <section className="materials-left">
                  <div className="section-title">
                    <span className="title-text">议题材料传达对象
                      <span className="info-trigger">
                        <span className="info-bubble">注意：集团总经理助理及以上不传达！</span>
                      </span>
                    </span>
                  </div>
                  <table className="data-table transmit-table">
                    <colgroup><col /><col /><col /><col /><col /><col /><col /><col /></colgroup>
                    <thead>
                      <tr>
                        <th>序号</th>
                        <th>职务分类</th>
                        <th>职务</th>
                        <th>股东代表</th>
                        <th>任职人</th>
                        <th>董事会参会人员</th>
                        <th>监事会</th>
                        <th>传达对象</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>董事</td><td>董事长</td><td>否</td><td>郑华峰</td><td className="checkbox-cell"><span className="tiny-check"></span></td><td>--</td><td className="checkbox-cell"><span className="tiny-check"></span></td></tr>
                      <tr><td>2</td><td>董事</td><td>职工董事</td><td>否</td><td>吴文君</td><td className="checkbox-cell"><span className="tiny-check"></span></td><td>--</td><td className="checkbox-cell"><span className="tiny-check"></span></td></tr>
                      <tr><td>3</td><td>董事</td><td>总经理助理</td><td>否</td><td>郑华峰</td><td className="checkbox-cell"><span className="tiny-check"></span></td><td>--</td><td className="checkbox-cell"><span className="tiny-check"></span></td></tr>
                      <tr><td>4</td><td>董事</td><td>董事长</td><td>否</td><td>郑华峰</td><td className="checkbox-cell"><span className="tiny-check"></span></td><td>--</td><td className="checkbox-cell"><span className="tiny-check"></span></td></tr>
                      <tr><td>5</td><td>董事</td><td>董事长</td><td>否</td><td>郑华峰</td><td className="checkbox-cell"><span className="tiny-check"></span></td><td>--</td><td className="checkbox-cell"><span className="tiny-check"></span></td></tr>
                    </tbody>
                  </table>
                  <div className="tooltip">郑华峰</div>
                </section>
                <section className="materials-right">
                  <div className="section-title">
                    <span className="title-text">职能联审议题材料传达对象
                      <span className="info-trigger">
                        <span className="info-bubble">请根据议题内容指定参与职能联审初审的职能部门。</span>
                      </span>
                    </span>
                  </div>
                  <div className="joint-card">
                    <div className="joint-row">
                      <div>财务部</div>
                      <div className="mini-switch active"></div>
                      <div className="joint-input">郑华峰<span className="search-icon"></span></div>
                    </div>
                    <div className="joint-row">
                      <div>审计风控与法务<br />部</div>
                      <div className="mini-switch active"></div>
                      <div className="joint-input">郑华峰<span className="search-icon"></span></div>
                    </div>
                    <div className="joint-row">
                      <div>股权投资部</div>
                      <div className="mini-switch"></div>
                      <div className="joint-input"><span></span><span className="search-icon"></span></div>
                    </div>
                    <div className="joint-row">
                      <div>党群工作部</div>
                      <div className="mini-switch"></div>
                      <div className="joint-input"><span></span><span className="search-icon"></span></div>
                    </div>
                    <div className="joint-row">
                      <div>综合管理部</div>
                      <div className="mini-switch"></div>
                      <div className="joint-input"><span></span><span className="search-icon"></span></div>
                    </div>
                  </div>
                </section>
              </div>
            </section>
      
            <section className="evaluate-page" id="evaluate-page">
              <div className="eval-action-bar">
                <button className="eval-top-btn primary" type="button">表决授权</button>
                <button className="eval-top-btn primary" type="button">用印申请</button>
              </div>
      
              <div className="eval-section-tabs">
                <button className="eval-section-tab active" data-eval-home-tab="list" type="button"><span className="eval-tab-icon check"></span>议题评估</button>
                <button className="eval-section-tab" data-eval-home-tab="qa" type="button"><span className="eval-tab-icon qa"></span>议题初审问答(0件未处理)</button>
              </div>
      
              <div className="eval-home-pane active" data-eval-home-pane="list">
                <button className="eval-sort-btn" type="button">自动分级排序</button>
                <table className="data-table eval-home-table">
                  <colgroup>
                    <col style={{ "width": "48px" }} /><col style={{ "width": "132px" }} /><col style={{ "width": "146px" }} /><col style={{ "width": "520px" }} />
                    <col style={{ "width": "78px" }} /><col style={{ "width": "92px" }} /><col style={{ "width": "54px" }} /><col style={{ "width": "54px" }} />
                    <col style={{ "width": "54px" }} /><col style={{ "width": "170px" }} /><col style={{ "width": "212px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>序号</th>
                      <th>议题分类<br />（大）</th>
                      <th>议题分类<br />（中）</th>
                      <th>议题分类（小）</th>
                      <th>议题<br />名称</th>
                      <th>审批<br />层级</th>
                      <th>董事会</th>
                      <th>监事会</th>
                      <th>股东会</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="center-nowrap">1</td>
                      <td className="category-main">1. 经营类</td>
                      <td className="category-mid">1.3 定期监管报告</td>
                      <td className="category-small">1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）</td>
                      <td className="name-cell">测试议题1</td>
                      <td className="approval-cell">业务总监</td>
                      <td className="meeting-flag">√</td>
                      <td className="meeting-flag">-</td>
                      <td className="meeting-flag">-</td>
                      <td className="center"><span className="eval-status-pill">评估中</span></td>
                      <td className="op-cell">
                        <span className="eval-op-stack">
                          <span className="eval-op" data-open-eval-detail="1">评估</span>
                          <span className="eval-op muted">上移</span>
                          <span className="eval-op">下移</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="center-nowrap">2</td>
                      <td className="category-main">1. 经营类</td>
                      <td className="category-mid">1.3 定期监管报告</td>
                      <td className="category-small">1.3.1 按国家部委等上级机构监管要求定期报告事项（含反洗钱、反欺诈、重大风险评估、绩效追索扣回、离任审计、内部控制等）</td>
                      <td className="name-cell">测试议题2</td>
                      <td className="approval-cell">业务总监</td>
                      <td className="meeting-flag">√</td>
                      <td className="meeting-flag">-</td>
                      <td className="meeting-flag">-</td>
                      <td className="center"><span className="eval-status-pill">评估中</span></td>
                      <td className="op-cell">
                        <span className="eval-op-stack">
                          <span className="eval-op" data-open-eval-detail="1">评估</span>
                          <span className="eval-op">上移</span>
                          <span className="eval-op muted">下移</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button className="eval-finish-btn" type="button">评估完成</button>
              </div>
      
              <div className="eval-qa-pane" data-eval-home-pane="qa">
                <div className="eval-qa-empty">暂无问答数据</div>
              </div>
            </section>
      
            <section className="audit-page" id="audit-page">
              <div className="audit-action-bar">
                <button className="audit-top-btn" data-open-audit-minutes type="button">一汽股权会议纪要</button>
                <button className="audit-top-btn" type="button">投票结果</button>
                <button className="audit-top-btn" type="button">表决授权</button>
                <button className="audit-top-btn" type="button">用印申请</button>
              </div>
      
              <div className="audit-tabs" aria-label="议题审核页签">
                <button className="audit-tab active" data-audit-tab="qa" type="button">议题初审问答(0件未处理)</button>
                <button className="audit-tab" data-audit-tab="materials" type="button">审批材料准备</button>
                <button className="audit-tab" data-audit-tab="department" type="button">提请部务会</button>
                <button className="audit-tab" data-audit-tab="approval" type="button">议题审批</button>
                <button className="audit-tab" data-audit-tab="joint" type="button">联审意见确认</button>
                <button className="audit-tab" data-audit-tab="after" type="button">会后材料替换</button>
              </div>
      
              <div className="audit-body">
                <section className="audit-pane active" data-audit-pane="qa">
                  <main className="audit-main">
                    <div className="audit-section-title">问答列表</div>
                    <div className="audit-toolbar">
                      <div className="audit-filter">
                        <span>提问筛选：</span>
                        <button className="active" type="button">全部问答</button>
                        <button type="button">职能部门</button>
                        <button type="button">仅看我</button>
                      </div>
                      <button className="audit-primary-btn" type="button">新增</button>
                    </div>
                    <table className="audit-table">
                      <colgroup><col style={{ "width": "90px" }} /><col /><col style={{ "width": "180px" }} /><col style={{ "width": "160px" }} /><col style={{ "width": "210px" }} /><col style={{ "width": "130px" }} /><col /></colgroup>
                      <thead><tr><th>序号</th><th>议题名称</th><th>提问部门</th><th>提问人</th><th>最后更新时间</th><th>状态</th><th>提问内容</th></tr></thead>
                    </table>
                    <div className="audit-empty"><div className="audit-empty-box"></div><div>暂无数据</div></div>
                  </main>
                  <aside className="audit-side">
                    <div className="audit-detail-title">问答详情</div>
                    <div className="audit-form-grid single">
                      <div className="audit-field"><label><span className="required">*</span> 议题</label><div className="audit-input muted"></div></div>
                      <div className="audit-field"><label>提问部门</label><div className="audit-input muted"></div></div>
                      <div className="audit-field"><label>提问内容</label><div className="audit-textarea muted"></div></div>
                      <div className="audit-field"><label>答复内容</label><div className="audit-textarea muted"></div></div>
                    </div>
                  </aside>
                  <footer className="audit-footer">
                    <button className="foot-btn primary wide" type="button">向分管领导汇报预览</button>
                    <button className="foot-btn" type="button">保存</button>
                  </footer>
                </section>
      
                <section className="audit-pane no-side" data-audit-pane="materials">
                  <main className="audit-main">
                    <div className="audit-material-section">
                      <div className="audit-section-title">董事会提请决策事项管理建议补充</div>
                      <table className="audit-table">
                        <colgroup><col style={{ "width": "72px" }} /><col style={{ "width": "260px" }} /><col style={{ "width": "130px" }} /><col style={{ "width": "170px" }} /><col /></colgroup>
                        <thead><tr><th>序号</th><th>议案名称</th><th>回避表决</th><th>表决意见</th><th>管理建议</th></tr></thead>
                        <tbody>
                          <tr><td className="center">1</td><td>测试议题1</td><td><div className="audit-select audit-avoid-select">是⌄</div></td><td><div className="audit-select muted"></div></td><td><div className="audit-input">1</div></td></tr>
                          <tr><td className="center">2</td><td>测试议题2</td><td><div className="audit-select audit-avoid-select">否⌄</div></td><td><div className="audit-select">同意⌄</div></td><td><div className="audit-input">2</div></td></tr>
                        </tbody>
                      </table>
                    </div>
      
                    <div className="audit-material-section">
                      <div className="audit-section-title">股东会提请决策事项管理建议补充</div>
                      <table className="audit-table">
                        <colgroup><col style={{ "width": "72px" }} /><col style={{ "width": "260px" }} /><col style={{ "width": "130px" }} /><col style={{ "width": "170px" }} /><col /></colgroup>
                        <thead><tr><th>序号</th><th>议案名称</th><th>回避表决</th><th>表决意见</th><th>管理建议</th></tr></thead>
                        <tbody>
                          <tr><td className="center">1</td><td>测试议题1</td><td><div className="audit-select audit-avoid-select">是⌄</div></td><td><div className="audit-select muted"></div></td><td><div className="audit-input">1</div></td></tr>
                          <tr><td className="center">2</td><td>测试议题2</td><td><div className="audit-select audit-avoid-select">否⌄</div></td><td><div className="audit-select">同意⌄</div></td><td><div className="audit-input">2</div></td></tr>
                        </tbody>
                      </table>
                    </div>
      
                    <div className="audit-inline-row" style={{ "marginTop": "18px" }}>
                      <div style={{ "fontSize": "21px", "fontWeight": "800", "color": "#2f36ff" }}>议题名称：</div>
                      <div className="audit-input">测试议题1</div>
                      <button className="audit-danger-btn" type="button">删除议题</button>
                    </div>
                    <div className="audit-inline-row">
                      <span style={{ "fontSize": "18px" }}>补充汇报材料</span>
                      <button className="audit-purple-btn" type="button">补充汇报材料</button>
                      <button className="audit-outline-btn" type="button">预览</button>
                    </div>
                    <table className="audit-table">
                      <colgroup><col style={{ "width": "80px" }} /><col style={{ "width": "180px" }} /><col style={{ "width": "180px" }} /><col /><col style={{ "width": "150px" }} /><col /><col style={{ "width": "120px" }} /></colgroup>
                      <thead><tr><th>序号</th><th>一级维度</th><th>二级维度</th><th>评价要素</th><th>权重(%)</th><th>评价标准</th><th>异常提示</th></tr></thead>
                      <tbody>
                        <tr><td className="center">1</td><td rowSpan="4" className="center">合规性</td><td>实质合规</td><td>外部管理规定</td><td></td><td>政策法规及国家部委等上级机构监管要求</td><td className="center"><span className="green-dot" style={{ "background": "red" }}></span></td></tr>
                        <tr><td className="center">2</td><td>实质合规</td><td>内部管理规定</td><td></td><td>该公司内部该类事项管理要求</td><td className="center"><span className="green-dot" style={{ "background": "red" }}></span></td></tr>
                        <tr><td className="center">3</td><td>实质合规</td><td>控股股东要求</td><td></td><td>控股股东该类事项要求</td><td className="center"><span className="green-dot" style={{ "background": "red" }}></span></td></tr>
                        <tr><td className="center">4</td><td>程序合规</td><td>审议程序</td><td></td><td>是否按制度要求进行前置审议</td><td className="center"><span className="green-dot" style={{ "background": "red" }}></span></td></tr>
                        <tr><td className="center">5</td><td>合理性</td><td>工作开展情况</td><td>工作开展成效</td><td>100</td><td>实际工作开展效果是否符合专项行动目标</td><td className="center"><span className="green-dot"></span></td></tr>
                      </tbody>
                    </table>
                    <div style={{ "margin": "18px 0 12px", "fontSize": "18px" }}>综合得分</div>
                    <div className="audit-score-scroll"></div>
                    <div className="audit-field"><label>董监事意见</label><div className="audit-input muted">未反馈</div></div>
                    <div className="audit-field" style={{ "marginTop": "28px" }}><label>提请决策事项</label><div className="audit-input">同意测试议题1</div></div>
                    <div className="audit-section-title" style={{ "marginTop": "34px" }}>议题投票</div>
                    <div className="audit-form-grid audit-vote-form">
                      <div className="audit-field full"><label>投票人：</label><div className="audit-input"></div></div>
                      <div className="audit-field full"><label>投票日：</label><div className="audit-input muted">请选择日期　□</div></div>
                      <div className="audit-field full"><label>投票方式：</label><div className="audit-select"></div></div>
                    </div>
                  </main>
                  <footer className="audit-footer">
                    <button className="foot-btn primary wide" type="button">向分管领导汇报预览</button>
                    <button className="foot-btn" type="button">保存</button>
                  </footer>
                </section>
      
                <section className="audit-pane" data-audit-pane="department">
                  <main className="audit-main">
                    <div className="audit-section-title">提请部务会</div>
                    <div className="audit-form-grid single">
                      <div className="audit-field"><label><span className="required">*</span> 期望决策时间</label><div className="audit-input muted">2026-04-27　　　　　　　　　　　　　　　　　　　　　　　　　　　　　□</div></div>
                      <div className="audit-field"><label><span className="required">*</span> 提请决策议题名称</label><div className="audit-input muted">富维公司测试发送钉钉的议案及表决建议</div></div>
                      <div className="audit-field"><label>会议主要议题</label>
                        <table className="audit-table"><colgroup><col style={{ "width": "96px" }} /><col /></colgroup><thead><tr><th>序号</th><th>议题名称</th></tr></thead><tbody><tr><td className="center">1</td><td>测试议题1</td></tr><tr><td className="center">2</td><td>测试议题2</td></tr></tbody></table>
                      </div>
                    </div>
                  </main>
                  <aside className="audit-side">
                    <div className="audit-status-head"><div className="audit-status-title">当前审批状态</div></div>
                    <div className="audit-timeline">
                      <div className="audit-time-item orange"><strong>申请人　郑华峰</strong><br /><br />2026-04-27 10:30:21</div>
                      <div className="audit-time-item green"><strong>科室经理　郑华峰</strong><span className="audit-pass">审批通过</span><br /><br />2026-04-28 19:18:09<br /><br />审批意见：审批通过</div>
                      <div className="audit-time-item"><strong>抄送　郑华峰</strong><span className="audit-copy-badge">抄送</span><br /><br />2026-04-27 10:30:22<br /><br />抄送对象</div>
                      <div className="audit-time-item"><strong>抄送　吴胜楠</strong><span className="audit-copy-badge">抄送</span><br /><br />2026-04-27 10:30:22<br /><br />抄送对象</div>
                    </div>
                  </aside>
                </section>
      
                <section className="audit-pane" data-audit-pane="approval">
                  <main className="audit-main">
                    <div className="audit-section-title">议题审批申请</div>
                    <div className="audit-form-grid">
                      <div className="audit-field full"><label><span className="required">*</span> 议题名称</label><div className="audit-input">长春富维集团汽车零部件股份有限公司测试发送钉钉议案及表决建议</div></div>
                      <div className="audit-field"><label>提报人</label><div className="audit-input muted">郑华峰</div></div>
                      <div className="audit-field"><label>提报部门</label><div className="audit-input muted">股权公司</div></div>
                      <div className="audit-field"><label>提报日期</label><div className="audit-input muted">2026-05-18</div></div>
                      <div className="audit-field"><label>分管领导</label><div className="audit-input"><span className="audit-token">郑华峰</span></div></div>
                      <div className="audit-field"><label>列席人</label><div className="audit-input"><span className="audit-token">郑华峰 ×</span></div></div>
                      <div className="audit-field"><label>汇报人</label><div className="audit-input muted">郑华峰</div></div>
                      <div className="audit-field"><label>法务联审</label><div className="audit-input muted">郑华峰</div></div>
                      <div className="audit-field"><label>综合管理联审</label><div className="audit-input muted"></div></div>
                      <div className="audit-field"><label>财务联审</label><div className="audit-input muted">郑华峰</div></div>
                      <div className="audit-field"><label>投资联审</label><div className="audit-input muted"></div></div>
                      <div className="audit-field"><label>投资部2总监</label><div className="audit-select">⌄</div></div>
                      <div className="audit-field"><label>党群联审</label><div className="audit-input muted"></div></div>
                    </div>
                    <div className="audit-approval-extra">
                      <div className="audit-form-grid">
                        <div className="audit-field">
                          <label><span className="required">*</span> 是否为三重一大事项：</label>
                          <div className="audit-radio-row">
                            <span><span className="audit-radio-dot active"></span>是</span>
                            <span><span className="audit-radio-dot"></span>否</span>
                          </div>
                        </div>
                        <div className="audit-field">
                          <label>三重一大事项</label>
                          <div style={{ "fontSize": "18px", "lineHeight": "1.8", "color": "#222833" }}>公司所出资的参股公司股东权利所涉及的重大事项（除新增参股公司外）</div>
                        </div>
                        <div className="audit-field">
                          <label><span className="required">*</span> 预计汇报时长（分钟）</label>
                          <div className="audit-input muted" style={{ "maxWidth": "180px" }}>50</div>
                        </div>
                        <div className="audit-field">
                          <label>拟上会时间</label>
                          <div className="audit-input muted">开始日期　　　　　　　→　结束日期　　　　　　　　　□</div>
                        </div>
                        <div className="audit-field full">
                          <label><span className="required">*</span> 议题内容概要</label>
                          <div className="audit-textarea muted">长春富维集团汽车零部件股份有限公司计划20260226召开测试1，saas，13
      股权运营部对相关议案形成表决建议</div>
                        </div>
                      </div>
      
                      <div className="audit-material-title">相关材料</div>
                      <div className="audit-red-copy">相关材料要求：<br />1、所有材料均需解密后上传会议系统<br />2、会议材料中如涉及插入附件，需将附件单独上传</div>
      
                      <div className="audit-approval-attach">
                        <div className="audit-approval-card full">
                          <div className="audit-approval-card-head">
                            <div className="audit-approval-card-title">业务总监审批</div>
                            <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                          </div>
                          <div className="audit-file-row">
                            <span>20260226(股权公司)富维公司测试1，saas，13议案及表决建议.pdf</span>
                            <span className="audit-file-actions">⊙ ↓</span>
                          </div>
                        </div>
      
                        <div className="audit-approval-card">
                          <div className="audit-approval-card-head">
                            <div className="audit-approval-card-title">分管领导审批</div>
                            <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                          </div>
                        </div>
      
                        <div className="audit-approval-card">
                          <div className="audit-approval-card-head">
                            <div className="audit-approval-card-title">总办会审批</div>
                            <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                          </div>
                          <div className="audit-file-row">
                            <span>20260226(股权公司)富维公司测试1，saas，13议案及表决建议.pdf</span>
                            <span className="audit-file-actions">⊙ ↓</span>
                          </div>
                        </div>
                      </div>
      
                      <div className="audit-decision-area">
                        <div className="audit-field full"><label>提请决策事项</label><div className="audit-textarea muted"></div></div>
                        <div className="audit-field"><label>提请决策事项截图</label><button className="audit-upload-btn" type="button">↥ 上传文件</button></div>
                        <div className="audit-field"><label>预期目标</label><div style={{ "fontSize": "18px", "lineHeight": "46px", "color": "#222833" }}>通过</div></div>
                        <div className="audit-field full"><label>备注</label><div className="audit-textarea muted"></div></div>
                      </div>
                    </div>
                  </main>
                  <aside className="audit-side">
                    <div className="audit-status-head"><div className="audit-status-title">当前审批状态</div><span className="audit-status-pill">未启动</span></div>
                  </aside>
                  <footer className="audit-footer">
                    <button className="foot-btn primary wide" type="button">向分管领导汇报预览</button>
                    <button className="foot-btn" type="button">上一步</button>
                    <button className="foot-btn" type="button">保存</button>
                    <button className="foot-btn primary" type="button">提交</button>
                  </footer>
                </section>
      
                <section className="audit-pane" data-audit-pane="joint">
                  <main className="audit-main">
                    <div className="audit-section-title blue">相关部门意见</div>
                    <table className="audit-table"><colgroup><col style={{ "width": "80px" }} /><col style={{ "width": "260px" }} /><col style={{ "width": "260px" }} /><col /></colgroup><thead><tr><th>序号</th><th>相关部门</th><th>反馈意见</th><th>意见解答</th></tr></thead><tbody><tr><td className="center">1</td><td>财务部</td><td>同意</td><td><div className="audit-input muted"></div></td></tr></tbody></table>
                    <div className="audit-section-title blue" style={{ "marginTop": "34px" }}>董事会提请决策事项</div>
                    <table className="audit-table"><colgroup><col style={{ "width": "80px" }} /><col /><col style={{ "width": "130px" }} /><col style={{ "width": "210px" }} /><col /></colgroup><thead><tr><th>序号</th><th>议案名称</th><th>回避表决</th><th>表决意见</th><th>管理建议</th></tr></thead><tbody><tr><td className="center">1</td><td>测试议题1</td><td><div className="audit-select audit-avoid-select">是⌄</div></td><td><div className="audit-select muted"></div></td><td><div className="audit-input muted"></div></td></tr><tr><td className="center">2</td><td>测试议题2</td><td><div className="audit-select audit-avoid-select">否⌄</div></td><td><div className="audit-select">同意⌄</div></td><td><div className="audit-input muted"></div></td></tr></tbody></table>
                    <div className="audit-section-title blue" style={{ "marginTop": "34px" }}>股东会提请决策事项</div>
                    <table className="audit-table"><colgroup><col style={{ "width": "80px" }} /><col /><col style={{ "width": "130px" }} /><col style={{ "width": "210px" }} /><col /></colgroup><thead><tr><th>序号</th><th>议案名称</th><th>回避表决</th><th>表决意见</th><th>管理建议</th></tr></thead><tbody><tr><td className="center">1</td><td>测试议题1</td><td><div className="audit-select audit-avoid-select">是⌄</div></td><td><div className="audit-select muted"></div></td><td><div className="audit-input muted"></div></td></tr><tr><td className="center">2</td><td>测试议题2</td><td><div className="audit-select audit-avoid-select">否⌄</div></td><td><div className="audit-select">同意⌄</div></td><td><div className="audit-input muted"></div></td></tr></tbody></table>
                    <div className="audit-inline-row" style={{ "marginTop": "40px" }}><div style={{ "fontSize": "21px", "fontWeight": "800", "color": "#2f36ff" }}>议题名称：</div><div className="audit-input muted">测试议题1</div><button className="audit-danger-btn" disabled type="button">删除议题</button></div>
                    <div className="audit-inline-row"><span style={{ "fontSize": "18px" }}>补充汇报材料</span><button className="audit-purple-btn" type="button">补充汇报材料</button><button className="audit-outline-btn" type="button">预览</button></div>
                    <table className="audit-table"><colgroup><col style={{ "width": "80px" }} /><col style={{ "width": "180px" }} /><col style={{ "width": "180px" }} /><col /><col style={{ "width": "150px" }} /><col style={{ "width": "120px" }} /></colgroup><thead><tr><th>序号</th><th>一级维度</th><th>二级维度</th><th>评价要素</th><th>权重(%)</th><th>异常提示</th></tr></thead><tbody><tr><td className="center">1</td><td rowSpan="3" className="center">合规性</td><td>实质合规</td><td>外部管理规定</td><td></td><td className="center"><span className="green-dot"></span></td></tr><tr><td className="center">2</td><td>实质合规</td><td>内部管理规定</td><td></td><td className="center"><span className="green-dot"></span></td></tr><tr><td className="center">3</td><td>实质合规</td><td>国资控股股东要求</td><td></td><td className="center"><span className="green-dot"></span></td></tr></tbody></table>
                    <div style={{ "margin": "20px 0 12px", "fontSize": "18px" }}>董监事意见</div><div className="audit-input muted">同意</div>
                    <div style={{ "margin": "28px 0 12px", "fontSize": "18px" }}>提请决策事项</div><div className="audit-input muted">同意测试议题2</div>
                  </main>
                  <aside className="audit-side"><div className="audit-status-head"><div className="audit-status-title">当前审批状态</div></div><div className="audit-timeline"><div className="audit-time-item"><strong>申请人　孔令娜</strong></div><div className="audit-time-item green"><strong>2.三重一大审核　耿姬</strong><span className="audit-pass">审批通过</span><br />2026-03-26 16:28:05</div><div className="audit-time-item green"><strong>13.归档　孔令娜</strong><span className="audit-pass">审批通过</span></div></div></aside>
                  <footer className="audit-footer"><button className="foot-btn primary wide" type="button">向总办会汇报预览</button></footer>
                </section>
      
                <section className="audit-pane no-side" data-audit-pane="after">
                  <main className="audit-main">
                    <div className="audit-after-block">
                      <div className="audit-section-title blue">相关部门意见</div>
                      <table className="audit-table">
                        <colgroup><col style={{ "width": "80px" }} /><col style={{ "width": "260px" }} /><col style={{ "width": "220px" }} /><col /></colgroup>
                        <thead><tr><th>序号</th><th>相关部门</th><th>反馈意见</th><th>意见解答</th></tr></thead>
                        <tbody>
                          <tr><td className="center">1</td><td>财务部</td><td>同意</td><td><div className="audit-input muted"></div></td></tr>
                          <tr><td className="center">2</td><td>综合管理部</td><td>同意</td><td><div className="audit-input muted"></div></td></tr>
                        </tbody>
                      </table>
                    </div>
      
                    <div className="audit-after-block">
                      <div className="audit-section-title blue">董事会提请决策事项</div>
                      <table className="audit-table">
                        <colgroup><col style={{ "width": "80px" }} /><col /><col style={{ "width": "130px" }} /><col style={{ "width": "210px" }} /><col /></colgroup>
                        <thead><tr><th>序号</th><th>议案名称</th><th>回避表决</th><th>表决意见</th><th>管理建议</th></tr></thead>
                        <tbody>
                          <tr><td className="center">1</td><td>测试议题1</td><td><div className="audit-select audit-avoid-select">是⌄</div></td><td><div className="audit-select muted"></div></td><td><div className="audit-input muted">建议进一步加大扭亏力度，确保2026年不增亏</div></td></tr>
                          <tr><td className="center">2</td><td>测试议题2</td><td><div className="audit-select audit-avoid-select">否⌄</div></td><td><div className="audit-select">同意⌄</div></td><td><div className="audit-input muted"></div></td></tr>
                        </tbody>
                      </table>
                    </div>
      
                    <div className="audit-after-block">
                      <div className="audit-section-title blue">股东会提请决策事项</div>
                      <table className="audit-table">
                        <colgroup><col style={{ "width": "80px" }} /><col /><col style={{ "width": "130px" }} /><col style={{ "width": "210px" }} /><col /></colgroup>
                        <thead><tr><th>序号</th><th>议案名称</th><th>回避表决</th><th>表决意见</th><th>管理建议</th></tr></thead>
                        <tbody>
                          <tr><td className="center">1</td><td>测试议题1</td><td><div className="audit-select audit-avoid-select">是⌄</div></td><td><div className="audit-select muted"></div></td><td><div className="audit-input muted">建议进一步加大扭亏力度，确保2026年不增亏</div></td></tr>
                          <tr><td className="center">2</td><td>测试议题2</td><td><div className="audit-select audit-avoid-select">否⌄</div></td><td><div className="audit-select">同意⌄</div></td><td><div className="audit-input muted"></div></td></tr>
                        </tbody>
                      </table>
                    </div>
      
                    <div className="audit-section-title blue">会后材料替换申请</div>
                    <div className="audit-form-grid">
                      <div className="audit-field"><label>议题名称</label><div className="audit-input muted">国汽（北京）智能网联汽车研究院有限公司第三届董事会第五次会议，2025年度股东会议案</div></div>
                      <div className="audit-field"><label>提报人</label><div className="audit-input muted">邵宁</div></div>
                      <div className="audit-field"><label>联审人员</label><div className="audit-input muted">陈昊,高峰,刘红艳</div></div>
                      <div className="audit-field"><label>提报部门</label><div className="audit-input muted">综合管理部</div></div>
                      <div className="audit-field"><label>列席人</label><div className="audit-input muted"><span className="audit-token">滑笑盈</span><span className="audit-token">黄国平</span><span className="audit-token">陈昊</span><span className="audit-token">高峰</span><span className="audit-token">刘红艳</span></div></div>
                      <div className="audit-field"><label>拟上会时间段</label><div className="audit-input muted">2026-04-09 10:03:11　　　→　2026-04-09 10:06:00　　□</div></div>
                      <div className="audit-field"><label>相关材料</label><div className="audit-red-copy">相关材料要求：<br />1、所有材料均需解密后上传会议系统<br />2、会议材料中如涉及插入附件，需将附件单独上传</div><button className="audit-upload-btn" type="button">↥ 上传文件</button><div className="audit-file-row"><span>20260410(股权运营部)国汽智能网联院第三届董事会第五次会议，2025年度股东会议案及表决建议.pdf</span><span className="audit-file-actions">⊙ ↓</span></div></div>
                      <div className="audit-field"><label>预计汇报时长（分钟）</label><div className="audit-input muted">10</div></div>
                    </div>
                  </main>
                  <footer className="audit-footer">
                    <button className="foot-btn primary wide" type="button">向总监汇报预览</button>
                    <button className="foot-btn primary wide" type="button">向分管领导汇报预览</button>
                    <button className="foot-btn primary wide" type="button">向总办会汇报预览</button>
                  </footer>
                </section>
              </div>
            </section>
      
            <section className="workflow-page" id="workflow-page">
              <div className="workflow-action-bar">
                <button className="audit-top-btn" data-open-audit-minutes type="button">一汽股权会议纪要</button>
                <button className="audit-top-btn" type="button">投票结果</button>
                <button className="audit-top-btn" type="button">表决授权</button>
                <button className="audit-top-btn" type="button">用印申请</button>
              </div>
      
              <div className="workflow-body">
                <section className="workflow-pane workflow-advice-pane active" data-workflow-pane="advice">
                  <div className="workflow-advice-layout">
                    <div className="workflow-advice-left">
                      <div className="audit-section-title">表决建议单</div>
                      <div className="workflow-form-stack">
                        <div>
                          <label>会议信息</label>
                          <div className="workflow-textarea">长春富维集团汽车零部件股份有限公司长春一汽富晟集团有限公司、22343、长春一汽富晟集团有限公司于2026年04月21日、2026年04月24日、2026年04月</div>
                        </div>
                        <div>
                          <label>审议情况</label>
                          <div className="audit-red-copy" style={{ "margin": "0 0 8px" }}>（请将***年**月**日改为实际日期）</div>
                          <div className="workflow-textarea">一汽股权投资（天津）有限公司分管副总已于xxxx年xx月xx日审议通过相关议题。</div>
                        </div>
                        <div>
                          <label>向董事会发起的建议</label>
                          <div className="workflow-textarea placeholder">请输入</div>
                        </div>
                        <div>
                          <label>向监事会发起的建议</label>
                          <div className="workflow-textarea placeholder">请输入</div>
                        </div>
                        <div>
                          <label>向股东会发起的建议</label>
                          <div className="workflow-textarea placeholder">请输入</div>
                        </div>
                      </div>
                    </div>
                    <div className="workflow-advice-right">
                      <div className="audit-section-title">表决建议</div>
                      <table className="audit-table">
                        <colgroup><col style={{ "width": "70px" }} /><col style={{ "width": "140px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "100px" }} /></colgroup>
                        <thead><tr><th>序号</th><th>议题名称</th><th>董事会表决建议</th><th>监事会表决建议</th><th>股东会表决建议</th><th>操作</th></tr></thead>
                        <tbody>
                          <tr><td className="center">1</td><td>测试议题1</td><td style={{ "color": "#1f2736", "fontWeight": "800" }}>回避表决</td><td className="center">-</td><td style={{ "color": "#1f2736", "fontWeight": "800" }}>回避表决</td><td className="center"><span className="eval-op muted">上移</span><span className="eval-op" style={{ "marginLeft": "14px" }}>下移</span></td></tr>
                          <tr><td className="center">2</td><td>测试议题2</td><td style={{ "color": "#1f2736", "fontWeight": "800" }}>同意</td><td className="center">-</td><td style={{ "color": "#1f2736", "fontWeight": "800" }}>同意</td><td className="center"><span className="eval-op">上移</span><span className="eval-op muted" style={{ "marginLeft": "14px" }}>下移</span></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="workflow-advice-footer">
                    <button className="workflow-download" type="button">下载表决建议单</button>
                    <div className="workflow-advice-footer-actions">
                      <button className="foot-btn" type="button">保存</button>
                      <button className="foot-btn primary" type="button">提交</button>
                    </div>
                  </div>
                </section>
      
                <section className="workflow-pane workflow-vote-pane" data-workflow-pane="vote">
                  <div className="audit-section-title">三会会议决议</div>
                  <div className="workflow-vote-upload-grid">
                    <div className="workflow-vote-card">
                      <div className="workflow-vote-title">董事会会议决议</div>
                      <div className="workflow-upload-row">
                        <span>我方发出版</span>
                        <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                        <span className="workflow-upload-tip">支持拓展名：.pdf</span>
                      </div>
                      <div className="workflow-upload-row">
                        <span>会议完整版</span>
                        <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                        <span className="workflow-upload-tip">支持拓展名：.pdf</span>
                      </div>
                    </div>
                    <div className="workflow-vote-card">
                      <div className="workflow-vote-title">监事会会议决议</div>
                      <div className="workflow-upload-row">
                        <span>我方发出版</span>
                        <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                        <span className="workflow-upload-tip">支持拓展名：.pdf</span>
                      </div>
                      <div className="workflow-upload-row">
                        <span>会议完整版</span>
                        <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                        <span className="workflow-upload-tip">支持拓展名：.pdf</span>
                      </div>
                    </div>
                    <div className="workflow-vote-card">
                      <div className="workflow-vote-title">股东会会议决议</div>
                      <div className="workflow-upload-row">
                        <span>我方发出版</span>
                        <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                        <span className="workflow-upload-tip">支持拓展名：.pdf</span>
                      </div>
                      <div className="workflow-upload-row">
                        <span>会议完整版</span>
                        <button className="audit-upload-btn" type="button">↥ 上传文件</button>
                        <span className="workflow-upload-tip">支持拓展名：.pdf</span>
                      </div>
                    </div>
                  </div>
                  <div className="audit-section-title">三会决议</div>
                  <div className="workflow-table-wrap">
                    <table className="audit-table workflow-table-wide">
                      <colgroup><col style={{ "width": "70px" }} /><col style={{ "width": "250px" }} /><col style={{ "width": "420px" }} /><col style={{ "width": "160px" }} /><col style={{ "width": "420px" }} /></colgroup>
                      <thead><tr><th>序号</th><th>议题名称</th><th>董事会决议</th><th>监事会决议</th><th>股东会决议/投委会决议</th></tr></thead>
                      <tbody>
                        <tr><td className="center">1</td><td>测试议题1</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td><td className="center">-</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td></tr>
                        <tr><td className="center">2</td><td>测试议题2</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td><td className="center">-</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="workflow-vote-footer">
                    <button className="foot-btn" type="button">保存</button>
                    <button className="foot-btn primary" type="button">提交</button>
                  </div>
                </section>
      
                <section className="workflow-pane workflow-execute-pane" data-workflow-pane="execute">
                  <div className="workflow-subnav">
                    <button className="active" type="button"><span className="workflow-tab-icon decision"></span>决策情况</button>
                    <button type="button"><span className="workflow-tab-icon assign"></span>议题交办</button>
                  </div>
                  <div className="workflow-table-wrap">
                    <table className="audit-table workflow-table-wide">
                      <colgroup><col style={{ "width": "80px" }} /><col style={{ "width": "300px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "180px" }} /><col style={{ "width": "180px" }} /><col style={{ "width": "160px" }} /><col style={{ "width": "200px" }} /><col style={{ "width": "140px" }} /><col style={{ "width": "220px" }} /></colgroup>
                      <thead>
                        <tr><th rowSpan="2">序号</th><th rowSpan="2">议题名称</th><th colSpan="3">总办会</th><th colSpan="3">三会决议</th><th rowSpan="2">一致性</th><th rowSpan="2">原因说明</th></tr>
                        <tr><th>董事会</th><th>监事会</th><th>股东会 / 投委会</th><th>董事会</th><th>监事会</th><th>股东会 / 投委会</th></tr>
                      </thead>
                      <tbody>
                        <tr><td className="center">1</td><td>测试议题1</td><td className="center">同意</td><td className="center">-</td><td className="center">同意</td><td className="center">回避表决</td><td className="center">-</td><td className="center">同意</td><td className="center" style={{ "color": "#ff2f3d", "fontWeight": "800" }}>不一致</td><td>-</td></tr>
                        <tr><td className="center">2</td><td>测试议题2</td><td className="center">同意</td><td className="center">-</td><td className="center">同意</td><td className="center">回避表决</td><td className="center">-</td><td className="center">同意</td><td className="center" style={{ "color": "#ff2f3d", "fontWeight": "800" }}>不一致</td><td>-</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </section>
      
            <section className="finance-review-page" aria-label="三会议题初审">
              <div className="finance-review-stack">
              <section className="finance-card">
                <div className="finance-card-head">会议信息</div>
                <div className="finance-card-body">
                  <div className="finance-meeting-list">
                    <table className="finance-table finance-meeting-table">
                      <colgroup><col style={{ "width": "130px" }} /><col style={{ "width": "120px" }} /><col /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "170px" }} /><col style={{ "width": "150px" }} /></colgroup>
                      <thead><tr><th>会议类型</th><th>是否召开</th><th>会议名称</th><th>通知时间</th><th>召开方式</th><th>会议时间/表决日期</th><th>会议地点</th></tr></thead>
                      <tbody>
                        <tr><td><span className="finance-meeting-type">董事会</span></td><td className="center"><span className="finance-meeting-toggle"><span className="finance-switch-track"></span>召开</span></td><td>富奥智能转向系统（长春）有限公司第一届董事会第六次会议</td><td className="center">2026-05-19</td><td className="center">现场会议</td><td className="center">2026-06-02 08:30</td><td className="center">请输入</td></tr>
                        <tr><td><span className="finance-meeting-type">股东会</span></td><td className="center"><span className="finance-meeting-toggle"><span className="finance-switch-track"></span>召开</span></td><td>富奥智能转向系统（长春）有限公司2026年第一次股东会</td><td className="center">2026-06-02</td><td className="center">通讯表决</td><td className="center">2026-06-04</td><td className="center">请输入</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              <section className="finance-card">
                <div className="finance-card-head">
                  <span>议题提报材料</span>
                  <button className="foot-btn primary" type="button">查看管户议题评估结果</button>
                </div>
                <div className="finance-card-body">
                  <table className="finance-table">
                    <colgroup><col style={{ "width": "64px" }} /><col style={{ "width": "80px" }} /><col /><col style={{ "width": "150px" }} /></colgroup>
                    <thead><tr><th><span className="finance-check-cell"></span></th><th>序号</th><th>文件名</th><th>批注</th></tr></thead>
                    <tbody>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">1</td><td><button className="finance-file-link" data-open-pdf-editor  type="button">1.png</button></td><td className="center"><span className="finance-annotation-badge none">不可批注</span></td></tr>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">2</td><td><button className="finance-file-link" data-open-pdf-editor  type="button">1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</button></td><td className="center"><span className="finance-annotation-badge none">不可批注</span></td></tr>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">3</td><td><button className="finance-file-link" data-open-pdf-editor="20250428中联电子议题关键信息页(1).pdf"  type="button">20250428中联电子议题关键信息页(1).pdf</button></td><td className="center"><span className="finance-annotation-badge zero">0条批注</span></td></tr>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">4</td><td><button className="finance-file-link" data-open-pdf-editor="20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf"  type="button">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</button></td><td className="center"><span className="finance-annotation-badge has">3条批注</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
              </div>
              <div className="finance-footer">
                <button className="foot-btn" type="button">保存</button>
                <button className="foot-btn primary" type="button">提交</button>
              </div>
            </section>
      
            <section className="legal-review-page" aria-label="三会议题法务初审">
              <div className="finance-review-stack">
              <section className="finance-card">
                <div className="finance-card-head">会议信息</div>
                <div className="finance-card-body">
                  <div className="finance-meeting-list">
                    <table className="finance-table finance-meeting-table">
                      <colgroup><col style={{ "width": "130px" }} /><col style={{ "width": "120px" }} /><col /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "170px" }} /><col style={{ "width": "150px" }} /></colgroup>
                      <thead><tr><th>会议类型</th><th>是否召开</th><th>会议名称</th><th>通知时间</th><th>召开方式</th><th>会议时间/表决日期</th><th>会议地点</th></tr></thead>
                      <tbody>
                        <tr><td><span className="finance-meeting-type">董事会</span></td><td className="center"><span className="finance-meeting-toggle"><span className="finance-switch-track"></span>召开</span></td><td>富奥智能转向系统（长春）有限公司第一届董事会第六次会议</td><td className="center">2026-05-19</td><td className="center">现场会议</td><td className="center">2026-06-02 08:30</td><td className="center">请输入</td></tr>
                        <tr><td><span className="finance-meeting-type">股东会</span></td><td className="center"><span className="finance-meeting-toggle"><span className="finance-switch-track"></span>召开</span></td><td>富奥智能转向系统（长春）有限公司2026年第一次股东会</td><td className="center">2026-06-02</td><td className="center">通讯表决</td><td className="center">2026-06-04</td><td className="center">请输入</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              <section className="finance-card">
                <div className="finance-card-head">
                  <span>议题提报材料</span>
                  <button className="foot-btn primary" type="button">查看管户议题评估结果</button>
                </div>
                <div className="finance-card-body">
                  <table className="finance-table">
                    <colgroup><col style={{ "width": "64px" }} /><col style={{ "width": "80px" }} /><col /><col style={{ "width": "150px" }} /></colgroup>
                    <thead><tr><th><span className="finance-check-cell"></span></th><th>序号</th><th>文件名</th><th>批注</th></tr></thead>
                    <tbody>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">1</td><td><button className="finance-file-link" data-open-pdf-editor  type="button">1.png</button></td><td className="center"><span className="finance-annotation-badge none">不可批注</span></td></tr>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">2</td><td><button className="finance-file-link" data-open-pdf-editor  type="button">1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</button></td><td className="center"><span className="finance-annotation-badge none">不可批注</span></td></tr>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">3</td><td><button className="finance-file-link" data-open-pdf-editor="20250428中联电子议题关键信息页(1).pdf"  type="button">20250428中联电子议题关键信息页(1).pdf</button></td><td className="center"><span className="finance-annotation-badge zero">0条批注</span></td></tr>
                      <tr><td className="center"><span className="finance-check-cell"></span></td><td className="center">4</td><td><button className="finance-file-link" data-open-pdf-editor="20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf"  type="button">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</button></td><td className="center"><span className="finance-annotation-badge has">3条批注</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="finance-card legal-opinion-card">
                <div className="finance-card-head">法务审核意见</div>
                <div className="finance-card-body">
                  <div className="legal-opinion-grid">
                    <div className="legal-opinion-field">
                      <label>风控合规审核意见</label>
                      <textarea placeholder="请输入"></textarea>
                    </div>
                    <div className="legal-opinion-field">
                      <label>风控合规风险提示应对建议</label>
                      <textarea placeholder="请输入"></textarea>
                    </div>
                  </div>
                </div>
              </section>
              </div>
              <div className="finance-footer">
                <button className="foot-btn" type="button">保存</button>
                <button className="foot-btn primary" type="button">提交</button>
              </div>
            </section>
      
            <div className="drawer-scrollbar"></div>
      
            <footer className="footer">
              <div className="footer-set active" data-footer="ai">
                <button className="foot-btn primary">下一步</button>
              </div>
              <div className="footer-set" data-footer="topics">
                <button className="foot-btn wide">上会材料预览</button>
                <button className="foot-btn">上一步</button>
                <button className="foot-btn primary">下一步</button>
              </div>
              <div className="footer-set" data-footer="meetings">
                <button className="foot-btn wide">上会材料预览</button>
                <button className="foot-btn">上一步</button>
                <button className="foot-btn primary">下一步</button>
              </div>
              <div className="footer-set" data-footer="materials">
                <button className="foot-btn wide">上会材料预览</button>
                <button className="foot-btn">上一步</button>
                <button className="foot-btn primary">保存</button>
                <button className="foot-btn primary">提交</button>
              </div>
            </footer>
          </main>
      
          <section className="audit-minutes-overlay" id="audit-minutes-overlay" aria-hidden="true">
            <div className="audit-minutes-mask"></div>
            <div className="audit-minutes-drawer">
              <header className="audit-minutes-head">
                <button className="audit-minutes-close" id="audit-minutes-close" type="button" aria-label="关闭会议纪要"></button>
                <div className="audit-minutes-title">一汽股权会议纪要</div>
              </header>
              <div className="audit-minutes-body">
                <div className="audit-minutes-tabs">
                  <button className="audit-minutes-tab active" type="button">总办会</button>
                  <button className="audit-minutes-tab" type="button">向分管副总汇报专题会</button>
                  <button className="audit-minutes-tab" type="button">向总监汇报专题会</button>
                </div>
                <div className="audit-minutes-form">
                  <div className="audit-minutes-field required">
                    <label>总办会召开日</label>
                    <div className="audit-minutes-date"><span>请选择日期</span><span>□</span></div>
                  </div>
                  <div className="audit-minutes-field">
                    <label>会议纪要</label>
                    <button className="audit-minutes-upload" type="button">↥ 上传文件</button>
                    <div style={{ "marginTop": "8px", "color": "#9aa2af", "fontSize": "18px" }}>支持扩展名：.pdf</div>
                  </div>
                  <div className="audit-minutes-field required">
                    <label>会议决策</label>
                    <table className="audit-table audit-minutes-decision-table">
                      <colgroup><col style={{ "width": "70px" }} /><col style={{ "width": "170px" }} /><col style={{ "width": "390px" }} /><col style={{ "width": "100px" }} /><col style={{ "width": "450px" }} /></colgroup>
                      <thead><tr><th>序号</th><th>议题名称</th><th>董事会</th><th>监事会</th><th>股东会/投委会</th></tr></thead>
                      <tbody>
                        <tr><td className="center">1</td><td>测试议题1</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td><td className="center">-</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td></tr>
                        <tr><td className="center">2</td><td>测试议题2</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td><td className="center">-</td><td><span className="workflow-radio-line">回避表决</span><span className="workflow-radio-line">同意</span><span className="workflow-radio-line">有条件同意</span><span className="workflow-radio-line">不同意</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <footer className="audit-minutes-footer">
                <button className="foot-btn" type="button">合并下载纪要</button>
              </footer>
            </div>
          </section>
      
          <section className="eval-detail-overlay" id="eval-detail-overlay" aria-hidden="true">
            <div className="eval-detail-mask"></div>
            <div className="eval-detail-shell">
              <div className="eval-detail-head">
                <button className="eval-detail-close" id="eval-detail-close" type="button" aria-label="关闭议题评估详情"></button>
                <div className="eval-detail-title">议题评估详情</div>
              </div>
      
              <div className="eval-detail-tabs">
                <button className="eval-detail-tab active" data-eval-detail-tab="execute" type="button"><span className="eval-tab-icon grade"><span></span></span>评估执行</button>
                <button className="eval-detail-tab" data-eval-detail-tab="opinion" type="button"><span className="eval-tab-icon opinion"><span></span></span>综合意见</button>
              </div>
      
              <section className="eval-detail-pane eval-exec-pane active" data-eval-detail-pane="execute">
                <div className="eval-detail-content">
                  <EvaluationExecution />
                  {false ? (
                  <div className="eval-exec-layout">
                    <div className="eval-attach-strip">
                      <div className="eval-attach-main">
                        <div className="eval-attach-title">附件确认</div>
                        <div className="eval-attach-meta" id="eval-attach-meta">
                          <div className="eval-attach-row head">
                            <div className="eval-attach-check"><span className="topic-check"></span></div>
                            <div className="eval-attach-index">序号</div>
                            <div>文件名</div>
                            <div>批注</div>
                            <div>操作</div>
                          </div>
                          <div className="eval-attach-row">
                            <div className="eval-attach-check"><span className="topic-check"></span></div>
                            <div className="eval-attach-index">1</div>
                            <div className="eval-attach-name">1.png</div>
                            <span className="eval-attach-note-pill yellow">不可批注</span>
                            <div className="eval-attach-op">删除</div>
                          </div>
                          <div className="eval-attach-row">
                            <div className="eval-attach-check"><span className="topic-check"></span></div>
                            <div className="eval-attach-index">2</div>
                            <div className="eval-attach-name">1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</div>
                            <span className="eval-attach-note-pill yellow">不可批注</span>
                            <div className="eval-attach-op">删除</div>
                          </div>
                          <div className="eval-attach-row">
                            <div className="eval-attach-check"><span className="topic-check"></span></div>
                            <div className="eval-attach-index">3</div>
                            <div className="eval-attach-name"><button className="pdf-file-link" data-open-main-pdf="20250428中联电子议题关键信息页(1).pdf" type="button">20250428中联电子议题关键信息页(1).pdf</button></div>
                            <span className="eval-attach-note-pill red">0条批注</span>
                            <div className="eval-attach-op">删除</div>
                          </div>
                          <div className="eval-attach-row">
                            <div className="eval-attach-check"><span className="topic-check"></span></div>
                            <div className="eval-attach-index">4</div>
                            <div className="eval-attach-name"><button className="pdf-file-link" data-open-main-pdf="20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf" type="button">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</button></div>
                            <span className="eval-attach-note-pill blue">3条批注</span>
                            <div className="eval-attach-op">删除</div>
                          </div>
                        </div>
                      </div>
                    </div>
      
                    <div className="eval-score-card">
                      <div className="eval-model-block">
                        <div className="eval-model-head">
                          <div className="eval-model-title">评估模型</div>
                          <div className="eval-model-actions">
                            <button className="foot-btn primary" data-open-eval-modal="model" type="button">更换模型</button>
                          </div>
                        </div>
                        <div className="eval-model-grid">
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">模型目录</div>
                            <div className="eval-model-field-value">1.经营类 / 1.3 定期监管报告 / 1.3.1 按国家部委等上级机构监管要求定期报告事项</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">模型版本</div>
                            <div className="eval-model-field-value">V1.0</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">联审方</div>
                            <div className="eval-model-field-value">审计风控与法务部 / 财务部</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">审批层级</div>
                            <div className="eval-model-field-value">业务总监</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">当前状态</div>
                            <div className="eval-model-field-value">有效</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">创建人</div>
                            <div className="eval-model-field-value">系统预置</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">最后更新人</div>
                            <div className="eval-model-field-value">郑华峰</div>
                          </div>
                          <div className="eval-model-field">
                            <div className="eval-model-field-label">最后更新时间</div>
                            <div className="eval-model-field-value">2025-06-21 19:05:05</div>
                          </div>
                        </div>
                      </div>
      
                      <div className="eval-score-head">
                        <div className="eval-score-title">评估评分</div>
                      </div>
                      <table className="data-table eval-grade-table">
                        <colgroup><col style={{ "width": "130px" }} /><col style={{ "width": "210px" }} /><col style={{ "width": "236px" }} /><col style={{ "width": "74px" }} /><col style={{ "width": "340px" }} /><col style={{ "width": "250px" }} /><col style={{ "width": "180px" }} /><col style={{ "width": "118px" }} /><col style={{ "width": "136px" }} /></colgroup>
                        <thead>
                          <tr>
                            <th>一级维度</th>
                            <th>二级维度</th>
                            <th>评价要素</th>
                            <th>权重</th>
                            <th>执行情况</th>
                            <th>评价规则</th>
                            <th>评价结果(分)</th>
                            <th>异常提示</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td rowSpan="4" className="dimension-cell">合规性</td><td>实质合规</td><td>外部管理规定</td><td></td><td><div className="eval-textbox">通过</div></td><td className="rule-cell">符合要求或不涉及，通过；...</td><td className="result-cell"><span className="eval-radio-outline"></span>不通过<br /><span className="eval-radio-outline active"></span>通过</td><td className="center"><span className="green-dot"></span></td><td className="center"><span className="eval-op" data-open-pdf-annotation="1">关联汇报材料</span></td></tr>
                          <tr><td>实质合规</td><td>内部管理规定</td><td></td><td><div className="eval-textbox">通过</div></td><td className="rule-cell">符合要求或不涉及，通过；...</td><td className="result-cell"><span className="eval-radio-outline"></span>不通过<br /><span className="eval-radio-outline active"></span>通过</td><td className="center"><span className="green-dot"></span></td><td className="center"><span className="eval-op" data-open-pdf-annotation="1">关联汇报材料</span></td></tr>
                          <tr><td>实质合规</td><td>控股股东要求</td><td></td><td><div className="eval-textbox" style={{ "borderColor": "#6ea1ff" }}>通过</div></td><td className="rule-cell">符合要求或不涉及，通过；...</td><td className="result-cell"><span className="eval-radio-outline"></span>不通过<br /><span className="eval-radio-outline active"></span>通过</td><td className="center"><span className="green-dot"></span></td><td className="center"><span className="eval-op" data-open-pdf-annotation="1">关联汇报材料</span></td></tr>
                          <tr><td>程序合规</td><td>审议程序</td><td></td><td><div className="eval-textbox">通过</div></td><td className="rule-cell">符合要求或不涉及，通过；...</td><td className="result-cell"><span className="eval-radio-outline"></span>不通过<br /><span className="eval-radio-outline active"></span>通过</td><td className="center"><span className="green-dot"></span></td><td className="center"><span className="eval-op" data-open-pdf-annotation="1">关联汇报材料</span></td></tr>
                          <tr><td className="dimension-cell">合理性</td><td>工作开展情况</td><td>成效、问题及相应举措</td><td className="center">100</td><td><div className="eval-textbox" style={{ "height": "74px" }}></div></td><td className="rule-cell">有效开展，或有相应问题解...</td><td className="result-cell"><input className="eval-score-input" defaultValue="100" /><br /><button className="foot-btn" style={{ "height": "32px", "minWidth": "98px", "padding": "0 16px", "marginTop": "8px", "color": "#6a60ff" }}>不打分</button></td><td className="center"><span className="green-dot"></span></td><td className="center"><span className="eval-op" data-open-pdf-annotation="1">关联汇报材料</span></td></tr>
                        </tbody>
                      </table>
                      <div className="eval-score-summary-row">
                        <div className="eval-grade-note">总得分(1、得分≥80分，议题通过；2、80分&gt;得≥60，议题通过，但要提出管理意见或提示项；3、得分&lt;60 分，不通过；4、合规性维度任意一项不通过，议题不通过)</div>
                        <div className="eval-grade-total">100</div>
                      </div>
                    </div>
                  </div>
                  ) : null}
                </div>
                <div className="eval-detail-footer">
                  <button className="foot-btn primary" type="button">保存</button>
                  <button className="foot-btn primary" data-eval-next="opinion" type="button">下一步</button>
                </div>
              </section>
      
              <section className="eval-detail-pane eval-opinion-pane" data-eval-detail-pane="opinion">
                <div className="eval-detail-content">
                  <div className="eval-opinion-layout">
                    <EvaluationModelScore />
                    <div className="eval-opinion-table-wrap">
                      <div className="eval-opinion-section-title">董监高意见</div>
                      <div className="eval-opinion-table-scroll">
                        <table className="data-table eval-opinion-table">
                          <colgroup><col style={{ "width": "84px" }} /><col style={{ "width": "260px" }} /><col style={{ "width": "260px" }} /><col style={{ "width": "240px" }} /><col /></colgroup>
                          <thead><tr><th>序号</th><th>职务分类</th><th>职务</th><th>任职人</th><th>意见</th></tr></thead>
                          <tbody>
                            <tr><td className="center">1</td><td>董事</td><td>董事长</td><td>郑华峰</td><td></td></tr>
                            <tr><td className="center">2</td><td>董事</td><td>职工董事</td><td>吴文君</td><td></td></tr>
                            <tr><td className="center">3</td><td>董事</td><td>总经理助理</td><td>郑华峰</td><td></td></tr>
                            <tr><td className="center">4</td><td>董事</td><td>董事长</td><td>郑华峰</td><td></td></tr>
                            <tr><td className="center">5</td><td>董事</td><td>董事长</td><td>郑华峰</td><td></td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="eval-opinion-form-card">
                      <div className="eval-opinion-section-title eval-opinion-summary-title">综合意见</div>
                      <div className="eval-opinion-form">
                        <div className="required">综合意见</div>
                        <div className="eval-opinion-radios">
                          <span><span className="eval-radio-outline active"></span>同意</span>
                          <span><span className="eval-radio-outline"></span>有条件同意（附管理建议）</span>
                          <span><span className="eval-radio-outline"></span>不同意</span>
                        </div>
                        <div style={{ "marginBottom": "14px" }}>管理建议</div>
                        <div className="eval-opinion-textarea">请输入管理建议</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="eval-detail-footer">
                  <button className="foot-btn" data-eval-prev="execute" type="button">上一步</button>
                  <button className="foot-btn primary wide" id="open-eval-supplement" type="button">补充汇报材料</button>
                  <button className="foot-btn" id="open-eval-preview" type="button">预览</button>
                  <button className="foot-btn primary" type="button">保存</button>
                  <button className="foot-btn primary" type="button">提交</button>
                </div>
              </section>
      
              <section className="eval-supplement-overlay" id="eval-supplement-overlay" aria-hidden="true">
                <div className="eval-fullsheet-head">
                  <div className="eval-fullsheet-title-wrap">
                    <button className="eval-fullsheet-close" id="close-eval-supplement" type="button" aria-label="关闭补充汇报材料"></button>
                    <div className="eval-fullsheet-title">补充汇报材料</div>
                  </div>
                </div>
                <div className="eval-supplement-body">
                  <div className="eval-supplement-steps">
                    <div>⚠ 第一步：可以混合上传多张图片和PDF文件。PDF文件会按打印分页自动拆解成多张图片。</div>
                    <div>⚠ 第二步：通过下面列表的第一列选择本议题展示的材料图片。</div>
                  </div>
                  <div className="eval-supplement-toolbar">
                    <button className="eval-upload-btn" type="button">上传文件</button>
                  </div>
                  <div className="eval-supplement-list">
                    <div className="eval-supplement-list-head">
                      <div className="center"><span className="eval-supplement-radio"></span></div>
                      <div>图片文件名</div>
                      <div>缩略图</div>
                      <div>来源</div>
                      <div>操作</div>
                    </div>
                    <div className="eval-supplement-list-body">
                      <div className="eval-supplement-list-row">
                        <div className="center"><span className="eval-supplement-radio"></span></div>
                        <div className="left">20250428中联电子议题关键信息页(1)P1.jpg</div>
                        <div className="center"><div className="eval-thumb-preview annotated"><span>批注</span></div></div>
                        <div className="center"><span className="eval-source-pill annotated">批注内容</span></div>
                        <div className="center"><span className="eval-supplement-ops"><span className="move">上移</span><span className="move">下移</span><span className="danger">删除</span></span></div>
                      </div>
                      <div className="eval-supplement-list-row">
                        <div className="center"><span className="eval-supplement-radio"></span></div>
                        <div className="left">董事会议案表决建议P2.jpg</div>
                        <div className="center"><div className="eval-thumb-preview annotated"><span>批注</span></div></div>
                        <div className="center"><span className="eval-source-pill annotated">批注内容</span></div>
                        <div className="center"><span className="eval-supplement-ops"><span className="move">上移</span><span className="move">下移</span><span className="danger">删除</span></span></div>
                      </div>
                      <div className="eval-supplement-list-row">
                        <div className="center"><span className="eval-supplement-radio"></span></div>
                        <div className="left">20250428中联电子议题关键信息页(1)P3.jpg</div>
                        <div className="center"><div className="eval-thumb-preview"></div></div>
                        <div className="center"><span className="eval-source-pill uploaded">手动上传</span></div>
                        <div className="center"><span className="eval-supplement-ops"><span className="move">上移</span><span className="move">下移</span><span className="danger">删除</span></span></div>
                      </div>
                      <div className="eval-supplement-list-row">
                        <div className="center"><span className="eval-supplement-radio"></span></div>
                        <div className="left">20250428中联电子议题关键信息页(1)P4.jpg</div>
                        <div className="center"><div className="eval-thumb-preview"></div></div>
                        <div className="center"><span className="eval-source-pill uploaded">手动上传</span></div>
                        <div className="center"><span className="eval-supplement-ops"><span className="move">上移</span><span className="move">下移</span><span className="danger">删除</span></span></div>
                      </div>
                    </div>
                  </div>
                  <div className="eval-supplement-save">
                    <button className="foot-btn primary" id="save-eval-supplement" type="button">保存</button>
                  </div>
                </div>
              </section>
      
              <section className="eval-preview-overlay" id="eval-preview-overlay" aria-hidden="true">
                <div className="eval-fullsheet-head">
                  <div className="eval-fullsheet-title-wrap">
                    <button className="eval-fullsheet-close" id="close-eval-preview" type="button" aria-label="关闭预览"></button>
                    <div className="eval-fullsheet-title">PDF预览</div>
                  </div>
                  <button className="foot-btn primary wide" type="button">打印/另存为PDF</button>
                </div>
                <div className="eval-preview-body">
                  <div className="eval-preview-sheet">
                    <section className="eval-preview-page">
                      <div className="eval-preview-doc-title">长春富维集团汽车零部件股份有限公司测试发送钉钉的议案及表决建议</div>
                      <div className="eval-preview-company-tag">股权公司</div>
                      <div className="eval-preview-rule"></div>
      
                      <div className="eval-preview-section">
                        <div className="eval-preview-section-title">提报材料</div>
                        <table className="eval-preview-table">
                          <colgroup><col style={{ "width": "90px" }} /><col /></colgroup>
                          <thead><tr><th>序号</th><th>文件</th></tr></thead>
                          <tbody><tr><td>1</td><td className="left">gitlab.jpg</td></tr></tbody>
                        </table>
                      </div>
      
                      <div className="eval-preview-section">
                        <div className="eval-preview-section-title">风控合规审核意见</div>
                      </div>
      
                      <div className="eval-preview-section">
                        <div className="eval-preview-section-title">风控合规风险提示应对建议</div>
                      </div>
      
                      <div className="eval-preview-section">
                        <div className="eval-preview-section-title">会议概况</div>
                        <table className="eval-preview-table">
                          <colgroup><col style={{ "width": "180px" }} /><col /><col style={{ "width": "220px" }} /><col style={{ "width": "180px" }} /></colgroup>
                          <thead><tr><th>会议分类</th><th>会议名称</th><th>会议日期</th><th>会议形式</th></tr></thead>
                          <tbody><tr><td>董事会</td><td className="left">测试发送钉钉</td><td>2026年04月27日</td><td>通讯表决</td></tr></tbody>
                        </table>
                      </div>
      
                      <div className="eval-preview-section">
                        <div className="eval-preview-section-title">议案信息</div>
                        <table className="eval-preview-table">
                          <colgroup><col style={{ "width": "90px" }} /><col /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /><col style={{ "width": "150px" }} /></colgroup>
                          <thead><tr><th>序号</th><th>议案名称</th><th>董事会</th><th>监事会</th><th>股东会</th></tr></thead>
                          <tbody><tr><td>1</td><td className="left">测试议题1</td><td>√<br />(回避表决)</td><td>–</td><td>–</td></tr></tbody>
                        </table>
                      </div>
                    </section>
                    <section className="eval-preview-page">
                      <div className="eval-preview-section">
                        <div className="eval-preview-section-title">议题1:测</div>
                        <table className="eval-preview-table">
                          <colgroup><col style={{ "width": "60px" }} /><col style={{ "width": "92px" }} /><col style={{ "width": "92px" }} /><col style={{ "width": "126px" }} /><col style={{ "width": "74px" }} /><col /><col style={{ "width": "78px" }} /><col style={{ "width": "430px" }} /><col style={{ "width": "126px" }} /><col style={{ "width": "90px" }} /></colgroup>
                          <thead>
                            <tr>
                              <th>序号</th>
                              <th>一级维度</th>
                              <th>二级维度</th>
                              <th>评价要素</th>
                              <th>权重</th>
                              <th>评价标准</th>
                              <th>执行情况</th>
                              <th>评价规则</th>
                              <th>评价结果(分)</th>
                              <th>异常提示</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>1</td><td rowSpan="4">合规性</td><td rowSpan="3">实质合规</td><td>外部管理规定</td><td>/</td><td className="left">政策法规及国家部委等上级机构的监管要求</td><td>12</td><td className="left">符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className="green-dot"></span></td></tr>
                            <tr><td>2</td><td>内部管理规定</td><td>/</td><td className="left">该公司内部该类事项管理要求</td><td>1</td><td className="left">符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className="green-dot"></span></td></tr>
                            <tr><td>3</td><td>控股股东要求</td><td>/</td><td className="left">控股股东该类事项要求</td><td>1</td><td className="left">符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className="green-dot"></span></td></tr>
                            <tr><td>4</td><td>程序合规</td><td>审议程序</td><td>/</td><td className="left">是否按制度要求进行前置审议</td><td>1</td><td className="left">符合要求或不涉及，通过；不符合要求，否决该议案</td><td>通过</td><td><span className="green-dot"></span></td></tr>
                            <tr><td>5</td><td>合理性</td><td>工作开展情况</td><td>工作开展成效</td><td>100%</td><td className="left">实际工作开展效果是否符合专项行动目标</td><td>111</td><td className="left">开展效果达到目标，得100分；开展效果未达到目标，得0分</td><td>1</td><td><span className="green-dot" style={{ "background": "#f31e1e" }}></span></td></tr>
                            <tr><td colSpan="3">综合得分</td><td colSpan="5" className="left">1、得分≥80分，议题通过；2、80分&gt;得≥60，议题通过，但要提出管理意见或提示项；3、得分&lt;60分，不通过；4、合规性维度任意一项不通过，议题不通过</td><td>1</td><td></td></tr>
                          </tbody>
                        </table>
      
                        <div className="eval-preview-proof-stack">
                          <div className="eval-preview-proof-row">
                            <article className="eval-preview-proof-image">
                              <div className="eval-preview-pdf-sheet">
                                <div className="eval-preview-image-head">20250428中联电子议题关键信息页(1)P1.jpg</div>
                                <div className="eval-preview-image-box">
                                  <div className="eval-preview-proof-doc">
                                    <div className="eval-preview-proof-doc-title">一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案</div>
                                    <div className="eval-preview-proof-doc-rule"></div>
                                    <div className="eval-preview-proof-section">
                                      <div className="eval-preview-proof-section-title">项目背景</div>
                                      <div className="eval-preview-proof-paragraph">
                                        一汽解放汽车有限公司发动机分公司向我公司转让31项报废设备，主要为报废清洗机、磨床、车床、抛光机、连杆螺母拧紧机等资产，
                                        <span className="eval-preview-proof-highlight">全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。</span>
                                        评估公司按照材质类资产进行评估，主要为废钢、废旧电机两类。
                                      </div>
                                    </div>
                                    <div className="eval-preview-proof-panel">
                                      <table className="eval-preview-proof-table">
                                        <colgroup>
                                          <col style={{ "width": "21%" }} />
                                          <col style={{ "width": "19%" }} />
                                          <col style={{ "width": "20%" }} />
                                          <col style={{ "width": "20%" }} />
                                          <col style={{ "width": "20%" }} />
                                        </colgroup>
                                        <thead>
                                          <tr>
                                            <th>项目编号</th>
                                            <th>项目名称</th>
                                            <th>账面原值</th>
                                            <th>账面净值</th>
                                            <th>评估净值<br />(含税，元)</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td>JYB-2025-0123</td>
                                            <td>一汽解放汽车有限公司发动机分公司31项报废设备</td>
                                            <td>92,509,505.36</td>
                                            <td>2,774,331.20</td>
                                            <td>676,413.48</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <div className="eval-preview-proof-region" style={{ "right": "10%", "top": "10%", "width": "38%", "height": "70%" }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                            <aside className="eval-preview-proof-side">
                              <div className="eval-preview-side-scroll">
                                <article className="eval-preview-side-card">
                                  <div className="eval-preview-side-tags">
                                    <div className="eval-preview-side-tag-group">
                                      <span className="eval-preview-side-tag page">第1页</span>
                                      <span className="eval-preview-side-tag type">框选批注</span>
                                    </div>
                                  </div>
                                  <div className="eval-preview-side-copy">关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。</div>
                                  <div className="eval-preview-side-meta">
                                    <span>郑华峰 2025-06-21 19:05</span>
                                    <span className="eval-preview-side-actions"><span className="edit">编辑</span><span className="delete">删除</span></span>
                                  </div>
                                </article>
                              </div>
                            </aside>
                          </div>
                          <div className="eval-preview-proof-row">
                            <article className="eval-preview-proof-image">
                              <div className="eval-preview-pdf-sheet">
                                <div className="eval-preview-image-head">董事会议案表决建议P2.jpg（含批注）</div>
                                <div className="eval-preview-image-box">
                                  <div className="eval-preview-proof-doc">
                                    <div className="eval-preview-proof-summary-title">补充评估说明</div>
                                    <div className="eval-preview-proof-doc-rule"></div>
                                    <div className="eval-preview-proof-section">
                                      <div className="eval-preview-proof-section-title">评估结论</div>
                                      <div className="eval-preview-proof-summary-copy">
                                        本次评估以现场查验资料为基础，结合已关联附件内容对资产状态、处置方式及监管要求进行综合判断。
                                        <span className="eval-preview-proof-highlight">报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。</span>
                                      </div>
                                      <div className="eval-preview-proof-summary-copy">
                                        <span className="eval-preview-proof-highlight">建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单，便于后续跟踪。</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                            <aside className="eval-preview-proof-side">
                              <div className="eval-preview-side-scroll">
                                <article className="eval-preview-side-card active">
                                  <div className="eval-preview-side-tags">
                                    <div className="eval-preview-side-tag-group">
                                      <span className="eval-preview-side-tag page">第2页</span>
                                      <span className="eval-preview-side-tag type">文字选择</span>
                                    </div>
                                  </div>
                                  <div className="eval-preview-side-copy">报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。</div>
                                  <div className="eval-preview-side-meta">
                                    <span>吴文君 2025-06-21 19:08</span>
                                    <span className="eval-preview-side-actions"><span className="edit">编辑</span><span className="delete">删除</span></span>
                                  </div>
                                </article>
                              </div>
                            </aside>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </section>
      
              <div className="eval-picker-modal" id="eval-attach-modal" aria-hidden="true">
                <div className="eval-picker-mask" data-close-eval-modal></div>
                <div className="eval-picker-shell">
                  <div className="eval-picker-head">
                    <div className="eval-picker-title" id="eval-attach-title">附件确认</div>
                    <button className="eval-detail-close" data-close-eval-modal type="button" aria-label="关闭附件确认"></button>
                  </div>
                  <div className="eval-picker-body">
                    <div className="eval-modal-toolbar" id="eval-attach-toolbar">
                      <button className="foot-btn primary" type="button" id="eval-attach-toolbar-btn">关联附件</button>
                    </div>
                    <div className="eval-associate-note" id="eval-attach-note">请勾选当前议题需要关联的附件，PDF 文件可点击进入批注编辑。</div>
                    <table className="data-table eval-file-table" id="eval-attach-table">
                      <colgroup><col style={{ "width": "54px" }} /><col style={{ "width": "84px" }} /><col /><col style={{ "width": "132px" }} /></colgroup>
                      <thead>
                        <tr>
                          <th><span className="topic-check"></span></th>
                          <th>序号</th>
                          <th>文件名</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="center"><span className="topic-check"></span></td><td className="center">1</td><td className="blue-link file-name">1.png</td><td className="danger center">删除</td></tr>
                        <tr><td className="center"><span className="topic-check"></span></td><td className="center">2</td><td className="blue-link file-name">1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</td><td className="danger center">删除</td></tr>
                        <tr><td className="center"><span className="topic-check"></span></td><td className="center">3</td><td className="file-name"><button className="pdf-file-link" data-open-pdf-editor="20250428中联电子议题关键信息页(1).pdf" type="button">20250428中联电子议题关键信息页(1).pdf</button></td><td className="danger center">删除</td></tr>
                        <tr><td className="center"><span className="topic-check"></span></td><td className="center">4</td><td className="file-name"><button className="pdf-file-link" data-open-pdf-editor="20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf" type="button">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</button></td><td className="danger center">删除</td></tr>
                      </tbody>
                    </table>
                    <div className="eval-picker-footer">
                      <button className="foot-btn" data-close-eval-modal type="button">关闭</button>
                      <button className="foot-btn primary" id="eval-attach-confirm" data-close-eval-modal type="button">确认</button>
                    </div>
                  </div>
                </div>
              </div>
      
              <div className="eval-picker-modal" id="eval-model-modal" aria-hidden="true">
                <div className="eval-picker-mask" data-close-eval-modal></div>
                <div className="eval-picker-shell">
                  <div className="eval-picker-head">
                    <div className="eval-picker-title">更换评估模型</div>
                    <button className="eval-detail-close" data-close-eval-modal type="button" aria-label="关闭模型选择"></button>
                  </div>
                  <div className="eval-picker-body">
                    <div className="eval-filter-row" style={{ "position": "static" }}>
                      <div className="eval-filter-field"><label>议题分类（大）</label><div className="fake-select">1.经营类<span className="chev"></span></div></div>
                      <div className="eval-filter-field"><label>议题分类（中）</label><div className="fake-select">1.3 定期监管报告<span className="chev"></span></div></div>
                      <div className="eval-filter-field"><label>议题分类（小）</label><div className="fake-select">ebd442f3b57c4308ba5faaaad44b15db<span className="chev"></span></div></div>
                      <div className="eval-filter-actions">
                        <button className="eval-outline-btn" type="button">重置</button>
                        <button className="eval-search-btn" type="button">查询</button>
                      </div>
                    </div>
                    <table className="data-table eval-model-table" style={{ "marginTop": "24px" }}>
                      <colgroup>
                        <col style={{ "width": "68px" }} /><col style={{ "width": "188px" }} /><col style={{ "width": "220px" }} /><col style={{ "width": "350px" }} />
                        <col style={{ "width": "90px" }} /><col style={{ "width": "148px" }} /><col style={{ "width": "220px" }} /><col style={{ "width": "260px" }} />
                        <col style={{ "width": "170px" }} /><col style={{ "width": "188px" }} /><col style={{ "width": "190px" }} /><col style={{ "width": "148px" }} /><col style={{ "width": "180px" }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th></th>
                          <th>议题分类（大）</th>
                          <th>议题分类（中）</th>
                          <th>议题分类（小）</th>
                          <th>版本</th>
                          <th>创建人</th>
                          <th>适用参股公司</th>
                          <th>适用场景说明</th>
                          <th>负责人</th>
                          <th>创建时间</th>
                          <th>最后更新人</th>
                          <th>最后更新时间</th>
                          <th>状态</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="eval-model-row-selected">
                          <td className="center"><span className="eval-radio-outline active"></span></td>
                          <td>1. 经营类</td>
                          <td>1.3 定期监管报告</td>
                          <td>1.3.1 按国家部委等上级机构监管要求定期报告事项</td>
                          <td className="center">1</td>
                          <td className="center">郑华峰</td>
                          <td>长春富维集团汽车零部件股份有限公司</td>
                          <td>适用于定期监管报告类议题的标准化评估与异常识别</td>
                          <td>郑华峰（wenjun.wu@ibm.com）</td>
                          <td className="center">2025-06-21 19:05:05</td>
                          <td className="center">郑华峰</td>
                          <td className="center">2025-06-21 19:05:05</td>
                          <td className="center"><span className="eval-status-pill" style={{ "minWidth": "118px", "color": "#44c6d9", "background": "linear-gradient(180deg,#e5fbef,#e5fbef)" }}>有效</span></td>
                          <td className="center"><span className="modal-op"><span className="eval-op">查看</span><span className="eval-op" data-close-eval-modal>更换模型</span></span></td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="eval-model-selected" style={{ "left": "28px", "top": "auto", "bottom": "84px" }}></div>
                    <div className="eval-picker-footer">
                      <button className="foot-btn" data-close-eval-modal type="button">取消</button>
                      <button className="foot-btn primary" data-close-eval-modal type="button">确认选择</button>
                    </div>
                  </div>
                </div>
              </div>
      
              <section className="pdf-editor-overlay" id="pdf-editor-overlay" aria-hidden="true">
                <div className="pdf-editor-head">
                  <button className="pdf-editor-back" id="pdf-editor-back" type="button" aria-label="返回附件确认"></button>
                  <div className="pdf-editor-title">编辑PDF</div>
                </div>
      
                <div className="pdf-toolbar">
                  <div className="pdf-toolbar-label" id="pdf-toolbar-label">标注模式：</div>
                  <label className="pdf-page-link-toggle">关联此页<input type="checkbox" id="pdf-page-link-toggle" /></label>
                  <div className="pdf-toolbar-switch">
                    <button className="pdf-mode-btn annotation-only" data-pdf-mode="all" type="button">全部页面</button>
                    <button className="pdf-mode-btn annotation-only" data-pdf-mode="existing" type="button">已有批注</button>
                    <button className="pdf-mode-btn annotation-only" data-pdf-mode="new" type="button">未加批注</button>
                    <button className="pdf-mode-btn attach-only active" data-pdf-mode="area" type="button">区域标记</button>
                    <button className="pdf-mode-btn attach-only" data-pdf-mode="text" type="button">文字选择</button>
                  </div>
                  <div className="pdf-toolbar-hint" id="pdf-toolbar-hint">拖动鼠标绘制矩形区域</div>
                  <button className="pdf-toolbar-cancel" id="pdf-toolbar-cancel" type="button">取消</button>
                </div>
      
                <div className="pdf-link-confirm" id="pdf-link-confirm" aria-hidden="true">
                  <div className="pdf-link-confirm-card">
                    <div className="pdf-link-confirm-title">确认关联当前页？</div>
                    <div className="pdf-link-confirm-copy">确认后，此页将作为当前评价要素的关联汇报材料。</div>
                    <div className="pdf-link-confirm-actions">
                      <button className="foot-btn" id="pdf-link-confirm-cancel" type="button">取消</button>
                      <button className="foot-btn primary" id="pdf-link-confirm-ok" type="button">确认关联</button>
                    </div>
                  </div>
                </div>
      
                <div className="pdf-editor-body">
                  <section className="pdf-main">
                    <div className="pdf-scroll" id="pdf-scroll">
                      <article className="pdf-page active" data-pdf-page="1" data-pdf-scope="full annotated">
                        <div className="pdf-page-title">一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">项目背景</div>
                        <p className="pdf-paragraph">
                          一汽解放汽车有限公司发动机分公司向我公司转让31项报废设备，主要为报废清洗机、磨床、车床、抛光机、连杆螺母拧紧机等资产，
                          <span className="pdf-selectable" data-selectable-id="text-1" data-page="1">全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。</span>
                          评估公司按照材质类资产进行评估，主要为废钢、废旧电机两类。现状及评估情况如下：
                        </p>
                        <table className="pdf-table">
                          <thead>
                            <tr>
                              <th>项目编号</th>
                              <th>项目名称</th>
                              <th>账面原值</th>
                              <th>账面净值</th>
                              <th>评估净值<br />(不含税、不含拆除费、元)</th>
                              <th>评估拆除费<br />(不含税、元)</th>
                              <th>评估净值<br />(含税、元)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>JYB-2025-0123</td>
                              <td>一汽解放汽车有限公司发动机分公司31项报废设备</td>
                              <td>92,509,505.36</td>
                              <td>2,774,331.20</td>
                              <td>598,596.00</td>
                              <td>0.00</td>
                              <td>676,413.48</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="pdf-section-title">资产购入</div>
                        <p className="pdf-paragraph">
                          建议一汽解放汽车有限公司发动机分公司31项报废设备按照评估单价购入，其中废钢1900.00元/吨（含税）、废旧电机5000.00元/吨（含税），最终根据各材质实际交付数量进行结算。
                        </p>
                        <div className="pdf-section-title">资产处置</div>
                        <p className="pdf-paragraph">
                          根据资产现状，结合市场行情，建议该批资产整包处置，其中废钢处置单价不低于
                          <span className="pdf-selectable" data-selectable-id="text-2" data-page="1" data-no-highlight="1">2,290.51元/吨（含税）、废旧电机处置单价不低于7,684.00元/吨（含税）</span>，
                          在汽购平台公开竞价处置。
                        </p>
      
                        <div className="pdf-annotation-box" data-annotation-id="area-1" data-page="1" style={{ "left": "560px", "top": "336px", "width": "570px", "height": "284px" }}></div>
                        <div className="pdf-canvas" data-pdf-canvas="1"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="2" data-pdf-scope="full annotated">
                        <div className="pdf-page-title">补充评估说明</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">评估结论</div>
                        <p className="pdf-paragraph">
                          本次评估以现场查验资料为基础，结合已关联附件内容对资产状态、处置方式及监管要求进行综合判断。
                          <span className="pdf-selectable" data-selectable-id="text-3" data-page="2">报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。</span>
                        </p>
                        <p className="pdf-paragraph">
                          <span className="pdf-selectable" data-selectable-id="discussion-1" data-page="2">建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单，便于后续跟踪。</span>
                        </p>
                        <div className="pdf-canvas idle" data-pdf-canvas="2"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="3" data-pdf-scope="full">
                        <div className="pdf-page-title">补充说明（第3页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">说明页</div>
                        <p className="pdf-paragraph">本页为正文延续内容，用于展示完整 PDF 在评估执行场景下的分页浏览效果。</p>
                        <div className="pdf-canvas idle" data-pdf-canvas="3"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="4" data-pdf-scope="full annotated">
                        <div className="pdf-page-title">补充说明（第4页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">评估依据</div>
                        <p className="pdf-paragraph"><span className="pdf-selectable" data-selectable-id="text-4" data-page="4">本页包含与资产定价依据相关的补充说明，可用于关联批注演示。</span></p>
                        <div className="pdf-canvas idle" data-pdf-canvas="4"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="5" data-pdf-scope="full">
                        <div className="pdf-page-title">补充说明（第5页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">说明页</div>
                        <p className="pdf-paragraph">本页为未标注的普通正文页，在关联批注视图中不会展示。</p>
                        <div className="pdf-canvas idle" data-pdf-canvas="5"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="6" data-pdf-scope="full">
                        <div className="pdf-page-title">补充说明（第6页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">说明页</div>
                        <p className="pdf-paragraph">本页为未标注的普通正文页，在关联批注视图中不会展示。</p>
                        <div className="pdf-canvas idle" data-pdf-canvas="6"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="7" data-pdf-scope="full annotated">
                        <div className="pdf-page-title">补充说明（第7页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">异常说明</div>
                        <p className="pdf-paragraph"><span className="pdf-selectable" data-selectable-id="text-7" data-page="7">本页标注资产净值与拆除费用之间的异常说明，便于关联到评分维度。</span></p>
                        <div className="pdf-canvas idle" data-pdf-canvas="7"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="8" data-pdf-scope="full">
                        <div className="pdf-page-title">补充说明（第8页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">说明页</div>
                        <p className="pdf-paragraph">本页为未标注的普通正文页，在关联批注视图中不会展示。</p>
                        <div className="pdf-canvas idle" data-pdf-canvas="8"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="9" data-pdf-scope="full annotated">
                        <div className="pdf-page-title">补充说明（第9页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">管理建议</div>
                        <p className="pdf-paragraph"><span className="pdf-selectable" data-selectable-id="text-9" data-page="9">本页标注管理建议相关段落，便于在综合意见环节快速引用。</span></p>
                        <div className="pdf-canvas idle" data-pdf-canvas="9"></div>
                      </article>
      
                      <article className="pdf-page" data-pdf-page="10" data-pdf-scope="full">
                        <div className="pdf-page-title">补充说明（第10页）</div>
                        <div className="pdf-page-rule"></div>
                        <div className="pdf-section-title">说明页</div>
                        <p className="pdf-paragraph">本页为未标注的普通正文页，在关联批注视图中不会展示。</p>
                        <div className="pdf-canvas idle" data-pdf-canvas="10"></div>
                      </article>
                    </div>
      
                    <div className="pdf-page-jump">
                      <button className="pdf-page-nav-btn" id="pdf-page-prev" type="button">上一页</button>
                      <div className="pdf-page-stepper">
                        <button className="pdf-page-step-btn" id="pdf-page-minus" type="button">-</button>
                        <input className="pdf-page-input" id="pdf-page-input" type="text" defaultValue="1" inputMode="numeric" />
                        <span className="pdf-page-total" id="pdf-page-total">/ 10</span>
                        <button className="pdf-page-step-btn" id="pdf-page-plus" type="button">+</button>
                      </div>
                      <button className="pdf-page-nav-btn" id="pdf-page-next" type="button">下一页</button>
                    </div>
      
                    <div className="pdf-note-pop" id="pdf-note-pop" style={{ "display": "none" }}>
                      <div className="pdf-note-title">填写说明</div>
                      <textarea className="pdf-note-input" id="pdf-note-input" placeholder="请输入批注说明"></textarea>
                      <div className="pdf-note-type">
                        <div className="pdf-note-type-label">需要提报人回复</div>
                        <div className="pdf-note-type-options">
                          <label className="pdf-note-type-option"><input type="radio" name="pdf-note-need-reply" defaultValue="yes" />是</label>
                          <label className="pdf-note-type-option"><input type="radio" name="pdf-note-need-reply" defaultValue="no" defaultChecked />否</label>
                        </div>
                      </div>
                      <div className="pdf-note-actions">
                        <button className="foot-btn" id="pdf-note-cancel" type="button">取消</button>
                        <button className="foot-btn primary" id="pdf-note-save" type="button">保存</button>
                      </div>
                    </div>
      
                    <div className="pdf-bottom-dock" id="pdf-bottom-dock">
                      <div className="pdf-bottom-info-row">
                        <div className="pdf-bottom-info">
                          <div className="pdf-bottom-info-label">评价要素</div>
                          <div className="pdf-bottom-info-value">外部管理规定</div>
                        </div>
                        <div className="pdf-bottom-info">
                          <div className="pdf-bottom-info-label">参股公司信息</div>
                          <div className="pdf-bottom-info-value">长春富维集团汽车零部件股份有限公司</div>
                        </div>
                        <div className="pdf-bottom-info">
                          <div className="pdf-bottom-info-label">议案名称</div>
                          <div className="pdf-bottom-info-value">2026年第三次临时股东会议案及表决建议</div>
                        </div>
                      </div>
      
                      <div className="pdf-bottom-select-row">
                        <div className="pdf-bottom-field">
                          <label>议题大类</label>
                          <select>
                            <option>1. 经营类</option>
                            <option>2. 投资类</option>
                          </select>
                        </div>
                        <div className="pdf-bottom-field">
                          <label>议题中类</label>
                          <select>
                            <option>1.3 定期监管报告</option>
                            <option>1.4 经营分析</option>
                          </select>
                        </div>
                        <div className="pdf-bottom-field">
                          <label>议题小类</label>
                          <select>
                            <option>1.3.1 按国家部委等上级机构监管要求定期报告事项</option>
                            <option>1.3.2 风险事项报告</option>
                          </select>
                        </div>
                        <div className="pdf-bottom-field">
                          <label>参股公司</label>
                          <select>
                            <option>长春富维集团汽车零部件股份有限公司</option>
                            <option>T3出行科技有限公司</option>
                          </select>
                        </div>
                        <div className="pdf-bottom-field">
                          <label>议案</label>
                          <select id="pdf-proposal-select">
                            <option value="">请选择议案</option>
                            <option>设备购入及处置方案</option>
                            <option>董事会会议案及表决建议</option>
                          </select>
                        </div>
                      </div>
      
                      <div className="pdf-bottom-attach-panel" id="pdf-bottom-attach-panel">
                        <div className="pdf-bottom-attach-list">
                          <div className="pdf-bottom-attach-row">
                            <div className="pdf-bottom-attach-type">PDF</div>
                            <button className="pdf-bottom-attach-file" type="button" data-open-pdf-editor>20250428中联电子议题关键信息页(1).pdf</button>
                            <button className="pdf-bottom-row-compare" type="button">对比</button>
                          </div>
                          <div className="pdf-bottom-attach-row">
                            <div className="pdf-bottom-attach-type">PDF</div>
                            <button className="pdf-bottom-attach-file" type="button" data-open-pdf-editor>20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</button>
                            <button className="pdf-bottom-row-compare" type="button">对比</button>
                          </div>
                          <div className="pdf-bottom-attach-row">
                            <div className="pdf-bottom-attach-type">DOCX</div>
                            <button className="pdf-bottom-attach-file" type="button">1.招标文件-备注版-明阳智能AI在多业务域应用试点项目-20250606.docx</button>
                            <button className="pdf-bottom-row-compare" type="button">对比</button>
                          </div>
                        </div>
                      </div>
      
                      <div className="pdf-bottom-actions-row">
                        <button className="pdf-bottom-action" type="button">参股公司信息</button>
                        <button className="pdf-bottom-action" type="button">一企一策</button>
                        <button className="pdf-bottom-action" type="button">战略规划</button>
                        <button className="pdf-bottom-action" type="button">财务报表</button>
                      </div>
                    </div>
                  </section>
      
                  <aside className="pdf-side">
                    <div className="pdf-side-head">
                      <div className="pdf-side-title" id="pdf-side-title">批注列表</div>
                      <button className="foot-btn primary" id="pdf-task-add" type="button">新增</button>
                    </div>
                    <div className="pdf-task-scroll">
                      <div className="pdf-task-list" id="pdf-task-list">
                        <article className="pdf-task-card active" data-annotation-card="area-1">
                          <div className="pdf-task-top">
                            <div className="pdf-task-tags">
                              <span className="pdf-tag page">第1页</span>
                              <span className="pdf-tag type">框选批注</span>
                            </div>
                          </div>
                          <div className="pdf-task-main">关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。</div>
                          <div className="pdf-task-foot">
                            <div className="pdf-task-meta">郑华峰  2025-06-21 19:05</div>
                            <div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div>
                          </div>
                        </article>
                        <article className="pdf-task-card" data-annotation-card="text-1">
                          <div className="pdf-task-top">
                            <div className="pdf-task-tags">
                              <span className="pdf-tag page">第1页</span>
                              <span className="pdf-tag type">文字选择</span>
                            </div>
                          </div>
                          <div className="pdf-task-main">确认“无法再使用”的判断依据是否需要补充现场照片或附表说明。</div>
                          <div className="pdf-task-foot">
                            <div className="pdf-task-meta">吴文君  2025-06-21 19:08</div>
                            <div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div>
                          </div>
                        </article>
                        <article className="pdf-task-card" data-annotation-card="discussion-1">
                          <div className="pdf-task-top">
                            <div className="pdf-task-tags">
                              <span className="pdf-tag page">第2页</span>
                              <span className="pdf-tag type">文字选择</span>
                              <span className="pdf-tag thread">2轮讨论</span>
                            </div>
                          </div>
                          <div className="pdf-task-main">建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单，便于后续跟踪。</div>
                          <div className="pdf-task-discussion">
                            <div className="pdf-discussion-summary">
                              <span>共 2 轮讨论</span>
                              <button className="pdf-discussion-toggle" type="button" data-expand-text="展开更早 1 轮讨论" data-collapse-text="收起更早讨论">展开更早 1 轮讨论</button>
                            </div>
                            <div className="pdf-discussion-history">
                              <div className="pdf-discussion-round">
                                <div className="pdf-discussion-message suggestion">
                                  <div className="pdf-discussion-head">吴文君 · 建议 · 2026-05-15 14:30</div>
                                  <div className="pdf-discussion-body">建议补充现场照片作为支撑，避免“无法再使用”的判断只停留在文字描述。</div>
                                </div>
                                <div className="pdf-discussion-message reply">
                                  <div className="pdf-discussion-head">创建人 · 回复 · 2026-05-15 15:02</div>
                                  <div className="pdf-discussion-body">已补充现场照片，后续会把对应页码同步到汇报材料里，方便会上直接引用。</div>
                                </div>
                              </div>
                            </div>
                            <div className="pdf-discussion-latest">
                              <div className="pdf-discussion-round">
                                <div className="pdf-discussion-message suggestion">
                                  <div className="pdf-discussion-head">郑华峰 · 建议 · 2026-05-15 17:18</div>
                                  <div className="pdf-discussion-body">建议把净值口径、处置价格依据和资产完备性说明拆成三条附件来源，便于风控复核。</div>
                                </div>
                                <div className="pdf-discussion-message reply">
                                  <div className="pdf-discussion-head">创建人 · 回复 · 2026-05-15 18:06</div>
                                  <div className="pdf-discussion-body">收到，我会按三项拆分成独立补充材料，并在汇报稿里逐条挂接到对应评价要素。</div>
                                </div>
                              </div>
                            </div>
                            <div className="pdf-discussion-actions">
                              <div className="pdf-discussion-empty"></div>
                              <div className="pdf-discussion-action-links">
                                <button className="pdf-discussion-link" type="button" data-discussion-reply>回复</button>
                                <button className="pdf-discussion-link" type="button" data-discussion-add>新增建议</button>
                              </div>
                            </div>
                            <div className="pdf-discussion-composer" data-discussion-composer>
                              <textarea placeholder="请输入建议或回复内容"></textarea>
                              <div className="pdf-discussion-composer-actions">
                                <button className="foot-btn" type="button" data-discussion-cancel>取消</button>
                                <button className="foot-btn primary" type="button" data-discussion-send>发送</button>
                              </div>
                            </div>
                          </div>
                          <div className="pdf-task-foot">
                            <div className="pdf-task-meta">系统预置  2026-05-15 18:06</div>
                            <div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div>
                          </div>
                        </article>
                      </div>
                    </div>
                  </aside>
      
                  <section className="pdf-compare-inline" id="pdf-compare-inline">
                    <div className="pdf-compare-panel">
                      <div className="pdf-compare-doc">
                        <div className="pdf-compare-doc-head">
                          <div className="pdf-compare-doc-meta">
                            <div className="pdf-compare-doc-title">20250428中联电子议题关键信息页(1).pdf</div>
                            <select className="pdf-compare-switch" data-compare-switch="1">
                              <option>20250428中联电子议题关键信息页(1).pdf</option>
                              <option>20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</option>
                            </select>
                          </div>
                        </div>
                        <div className="pdf-compare-page">
                          <div className="pdf-page-title">一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案</div>
                          <div className="pdf-page-rule"></div>
                          <p className="pdf-paragraph">全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。评估前需补充附件来源说明。</p>
                          <table className="pdf-table">
                            <thead>
                              <tr><th>项目编号</th><th>账面净值</th><th>评估净值</th></tr>
                            </thead>
                            <tbody>
                              <tr><td>JYB-2025-0123</td><td>2,774,331.20</td><td>598,596.00</td></tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="pdf-compare-pager" data-compare-pager="1">
                          <button className="pdf-page-nav-btn" data-compare-prev="1" type="button">上一页</button>
                          <div className="pdf-page-stepper">
                            <button className="pdf-page-step-btn" data-compare-minus="1" type="button">-</button>
                            <input className="pdf-page-input" data-compare-input="1" type="text" defaultValue="1" inputMode="numeric" />
                            <span className="pdf-page-total" data-compare-total="1">/ 10</span>
                            <button className="pdf-page-step-btn" data-compare-plus="1" type="button">+</button>
                          </div>
                          <button className="pdf-page-nav-btn" data-compare-next="1" type="button">下一页</button>
                        </div>
                      </div>
                      <div className="pdf-compare-side">
                        <div className="pdf-compare-side-title">批注列表</div>
                        <div className="pdf-compare-task-scroll">
                          <div className="pdf-compare-task-list">
                            <article className="pdf-task-card active">
                              <div className="pdf-task-top">
                                <div className="pdf-task-tags"><span className="pdf-tag page">第1页</span><span className="pdf-tag type">框选批注</span></div>
                              </div>
                              <div className="pdf-task-main">关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。</div>
                              <div className="pdf-task-foot"><div className="pdf-task-meta">郑华峰 2025-06-21 19:05</div><div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div></div>
                            </article>
                          </div>
                        </div>
                      </div>
                    </div>
      
                    <div className="pdf-compare-panel">
                      <div className="pdf-compare-doc">
                        <div className="pdf-compare-doc-head">
                          <button className="pdf-compare-back" id="pdf-compare-inline-back" type="button" aria-label="返回当前编辑页">返回</button>
                          <div className="pdf-compare-doc-meta">
                            <div className="pdf-compare-doc-title">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</div>
                            <select className="pdf-compare-switch" data-compare-switch="2">
                              <option>20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</option>
                              <option>20250428中联电子议题关键信息页(1).pdf</option>
                            </select>
                          </div>
                        </div>
                        <div className="pdf-compare-page">
                          <div className="pdf-page-title">董事会会议案及表决建议</div>
                          <div className="pdf-page-rule"></div>
                          <p className="pdf-paragraph">建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。</p>
                          <p className="pdf-paragraph">本页展示对比文档中的关键批注段落，供评估员上下参照阅读。</p>
                        </div>
                        <div className="pdf-compare-pager" data-compare-pager="2">
                          <button className="pdf-page-nav-btn" data-compare-prev="2" type="button">上一页</button>
                          <div className="pdf-page-stepper">
                            <button className="pdf-page-step-btn" data-compare-minus="2" type="button">-</button>
                            <input className="pdf-page-input" data-compare-input="2" type="text" defaultValue="2" inputMode="numeric" />
                            <span className="pdf-page-total" data-compare-total="2">/ 10</span>
                            <button className="pdf-page-step-btn" data-compare-plus="2" type="button">+</button>
                          </div>
                          <button className="pdf-page-nav-btn" data-compare-next="2" type="button">下一页</button>
                        </div>
                      </div>
                      <div className="pdf-compare-side">
                        <div className="pdf-compare-side-title">批注列表</div>
                        <div className="pdf-compare-task-scroll">
                          <div className="pdf-compare-task-list">
                            <article className="pdf-task-card">
                              <div className="pdf-task-top">
                                <div className="pdf-task-tags"><span className="pdf-tag page">第2页</span><span className="pdf-tag type">文字选择</span></div>
                              </div>
                              <div className="pdf-task-main">报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。</div>
                              <div className="pdf-task-foot"><div className="pdf-task-meta">吴文君 2025-06-21 19:08</div><div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div></div>
                            </article>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </section>
      
              <div className="pdf-compare-overlay" id="pdf-compare-overlay" aria-hidden="true">
                <div className="pdf-compare-mask"></div>
                <div className="pdf-compare-drawer">
                  <button className="pdf-compare-close" id="pdf-compare-close" type="button" aria-label="关闭对比抽屉"></button>
                  <div className="pdf-compare-panel">
                    <div className="pdf-compare-doc">
                      <div className="pdf-compare-doc-title">20250428中联电子议题关键信息页(1).pdf</div>
                      <div className="pdf-compare-page">
                        <div className="pdf-page-title">一汽解放汽车有限公司发动机分公司31项报废设备购入及处置方案</div>
                        <div className="pdf-page-rule"></div>
                        <p className="pdf-paragraph">全部资产均已拆除完毕，存放在解放卡车厂院内，根据现场实际情况判断，均已无法再使用。评估前需补充附件来源说明。</p>
                        <table className="pdf-table">
                          <thead>
                            <tr><th>项目编号</th><th>账面净值</th><th>评估净值</th></tr>
                          </thead>
                          <tbody>
                            <tr><td>JYB-2025-0123</td><td>2,774,331.20</td><td>598,596.00</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="pdf-compare-pager">
                        <button className="pdf-page-nav-btn" type="button">上一页</button>
                        <div className="pdf-page-stepper">
                          <button className="pdf-page-step-btn" type="button">-</button>
                          <input className="pdf-page-input" type="text" defaultValue="1" inputMode="numeric" />
                          <span className="pdf-page-total">/ 10</span>
                          <button className="pdf-page-step-btn" type="button">+</button>
                        </div>
                        <button className="pdf-page-nav-btn" type="button">下一页</button>
                      </div>
                    </div>
                    <div className="pdf-compare-side">
                      <div className="pdf-compare-side-title">批注列表</div>
                      <div className="pdf-compare-task-list">
                        <article className="pdf-task-card active">
                          <div className="pdf-task-top">
                            <div className="pdf-task-tags"><span className="pdf-tag page">第1页</span><span className="pdf-tag type">框选批注</span></div>
                          </div>
                          <div className="pdf-task-main">关键净值与拆除费用表格区域，需要在评估前补充附件来源说明。</div>
                          <div className="pdf-task-foot"><div className="pdf-task-meta">郑华峰 2025-06-21 19:05</div><div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div></div>
                        </article>
                      </div>
                    </div>
                  </div>
      
                  <div className="pdf-compare-panel">
                    <div className="pdf-compare-doc">
                      <div className="pdf-compare-doc-title">20260403(股权运营部)T3出行第二届董事会2026年第一次会议、2026年第三次临时股东会议案及表决建议.pdf</div>
                      <div className="pdf-compare-page">
                        <div className="pdf-page-title">董事会会议案及表决建议</div>
                        <div className="pdf-page-rule"></div>
                        <p className="pdf-paragraph">建议在董事会审议前完成净值口径、处置价格依据及资产完备性说明的补充标注，并同步形成任务清单。</p>
                        <p className="pdf-paragraph">本页展示对比文档中的关键批注段落，供评估员上下参照阅读。</p>
                      </div>
                      <div className="pdf-compare-pager">
                        <button className="pdf-page-nav-btn" type="button">上一页</button>
                        <div className="pdf-page-stepper">
                          <button className="pdf-page-step-btn" type="button">-</button>
                          <input className="pdf-page-input" type="text" defaultValue="2" inputMode="numeric" />
                          <span className="pdf-page-total">/ 10</span>
                          <button className="pdf-page-step-btn" type="button">+</button>
                        </div>
                        <button className="pdf-page-nav-btn" type="button">下一页</button>
                      </div>
                    </div>
                    <div className="pdf-compare-side">
                      <div className="pdf-compare-side-title">批注列表</div>
                      <div className="pdf-compare-task-list">
                        <article className="pdf-task-card">
                          <div className="pdf-task-top">
                            <div className="pdf-task-tags"><span className="pdf-tag page">第2页</span><span className="pdf-tag type">文字选择</span></div>
                          </div>
                          <div className="pdf-task-main">报告中对于关键净值、拆除费用与管理要求的表述需进一步核对原始附件。</div>
                          <div className="pdf-task-foot"><div className="pdf-task-meta">吴文君 2025-06-21 19:08</div><div className="pdf-task-actions"><span>编辑</span><span className="danger">删除</span></div></div>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
    </>
  );
}
