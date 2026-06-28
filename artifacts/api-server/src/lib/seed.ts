import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // ───────────────────────────────────────────────────────────────
  // Unit 1 — Fundamental Concepts: Inference, Entailment, Confirmation, Knowledge
  // ───────────────────────────────────────────────────────────────
  {
    slug: "concept-of-inference",
    title: "The Concept of Inference",
    weekNumber: 1,
    blurb: "Forming a new belief on the basis of an old one — and what AI does instead.",
    lectureTitle: "1.1 The Concept of Inference: Forming a New Belief on the Basis of an Old One",
    body: `# The Concept of Inference

At its root, **inference is forming a new belief on the basis of an old one**. You believe one thing; on the strength of it you come to believe another. This single idea is the foundation of all logic, and it is where the classical and the AI views first part company.

## The traditional view

Consider a stock example. Larry moves into the house, and shortly afterward valuables start disappearing. No one else has access, and there is no other explanation in sight. You did not *see* Larry take anything — yet you come to believe he is the thief. That move, from what you already accept to a new conclusion, is an inference. Traditional logic then divides knowledge into two kinds: **direct (non-inferential)** knowledge, like the immediate report of your senses, and **indirect (inferential)** knowledge, reached by reasoning from something else. Some philosophers argue *all* knowledge is inferential, but the classical picture insists that some beliefs are more immediate than others.

## The AI perspective

An AI system transforms this picture. Rather than holding discrete beliefs and stepping from one to the next, it makes inferences by **activating patterns in a neural network** according to learned associations. There is no clean line between "direct" and "indirect" knowledge — everything the system knows lives as **weighted connections**. It does not take a single logical step; it lets many partial patterns light up *in parallel*, producing an output from statistical regularities rather than from a chain of explicit propositions. Its inferences are fuzzy and probabilistic, not binary true-or-false moves.

## A worked example

A fraud-detection model flags a transaction as suspicious. It did not reason "this card was used in two cities an hour apart, therefore fraud" the way a detective would reason about Larry. It absorbed millions of past transactions and tuned its weights so that the current pattern of features pushes its output toward "fraud." The conclusion is real and useful — but it was reached by pattern activation, not by forming one belief explicitly on the basis of another. Same job, inference; profoundly different mechanism.`,
  },
  {
    slug: "types-of-inference",
    title: "Types of Inference",
    weekNumber: 1,
    blurb: "Deductive, inductive, and abductive — and how AI blurs the three together.",
    lectureTitle: "1.2 Types of Inference: Deductive, Inductive, and Abductive",
    body: `# Types of Inference: Deductive, Inductive, and Abductive

Classical logic sorts inference into three kinds, distinguished by how tightly the premises bind the conclusion.

## The three classical types

**Deductive** inference makes the conclusion *certain* if the premises are true: "Smith drives a Rolls Royce; a Rolls Royce is a car; therefore Smith drives a car." There is no way for the premises to hold and the conclusion to fail. **Inductive** inference makes the conclusion *probable* but not guaranteed: "Smith drives a Rolls Royce and lives in a large house; therefore Smith is wealthy." The evidence supports the conclusion without forcing it. **Abductive** inference is *inference to the best explanation*: the valuables vanished and Larry just moved in, so the best available explanation is that Larry took them. Abduction posits a cause to account for what we observe.

## The AI perspective

An AI system does not pick one of these and apply it. It **blurs the distinction**, operating through pattern recognition: it matches the current input to learned patterns and produces an output whose confidence varies *continuously* rather than snapping to "certain" or "merely probable." When a model performs **chain-of-thought** reasoning — breaking a problem into written steps — the output can *look* deductive, with each step following the last, but underneath it is still statistical pattern completion. Multiple valid reasoning paths can exist at once, and the same prompt can travel different ones.

## A worked example

Ask a language model "Socrates is a man; all men are mortal; is Socrates mortal?" and it will answer "yes" with a clean deductive-looking justification. It did not run a logical proof engine. It recognized the syllogism pattern from training and generated the most plausible continuation. The answer is correct, and it resembles deduction — but the machinery is the same continuous pattern matching it uses for the fuzziest inductive guess. Classical logic keeps the three types sharply separate; AI collapses them into degrees of pattern activation.`,
  },
  {
    slug: "entailment-vs-pattern-activation",
    title: "Entailment vs. Pattern Activation",
    weekNumber: 1,
    blurb: "Logical necessity against learned association — the heart of the difference.",
    lectureTitle: "1.3 Entailment vs. Pattern Activation: Logical Necessity Against Learned Association",
    body: `# Entailment vs. Pattern Activation

If one idea captures how AI logic differs from classical logic, it is this: **entailment becomes pattern activation**.

## The traditional view

Classical logic defines entailment strictly. Statement A **entails** statement B when B *cannot* be false if A is true. This is a necessary, binary relationship rooted in logical structure: "It is raining and cold" entails "It is raining," and there is no scenario, however strange, in which the first holds and the second fails. Entailment does not care about context, frequency, or the world's contingencies. It is all-or-nothing necessity.

## The AI perspective

AI systems replace this with **pattern activation**. One pattern activates another because they were *associated in the training data*, not because logic forbids them to come apart. Activation strength varies continuously — a little, a lot, somewhere in between — and it is **context-dependent**: the same pattern can activate different others depending on what surrounds it. Several patterns can partially activate at the same time. The relationship rests on statistical regularity, not necessity. Where classical logic asks "could B be false while A is true?", an AI system effectively asks "given A, how strongly does B light up?"

## A worked example

To a language model, "doctor" strongly activates "hospital," "patient," and "stethoscope." None of these is *entailed* by "doctor" — a doctor can be on a beach with no hospital in sight — yet the activations are powerful because the words co-occur constantly in training text. Meanwhile a genuine entailment like "is a doctor" → "is a person" is, to the model, just another learned association, held no more sacredly than "doctor → hospital." The model has no separate machinery for necessity. That is the trade: it gains rich, flexible, context-sensitive association, and it loses the guarantee that a true premise can never yield a false conclusion.`,
  },
  {
    slug: "over-valuation-entailment",
    title: "The Over-Valuation of Entailment",
    weekNumber: 1,
    blurb: "Why model-theoretic entailment is prized too highly — and what AI uses instead.",
    lectureTitle: "1.4 The Over-Valuation of Model-Theoretic Entailment",
    body: `# The Over-Valuation of Model-Theoretic Entailment

Classical logic places **model-theoretic entailment** at its center. This lecture argues that the notion is *over-valued* — and that AI quietly shows why.

## The traditional view

Model-theoretic entailment says: A entails B if there is **no coherently conceivable scenario** in which A is true and B is false. It is the gold standard of logical consequence. But it has a famous embarrassment. Any necessary truth is model-theoretically entailed by any other, because there is no scenario where a necessary truth is false. So "1 + 1 = 2" entails "triangles have three sides" — the relationship holds, even though the two statements are *conceptually unrelated*. The criterion certifies connections that no reasoning agent would ever actually use. It tracks impossibility of counterexample, not relevance or genuine inferential dependence.

## The AI perspective

AI systems sidestep this by trading entailment for **proximity in an embedding space**. Relationships are *learned from data*, so the connections a model represents are exactly the ones that recur in real use — relevant ones. "1 + 1 = 2" and "triangles have three sides" sit far apart in the model's space because nothing in experience links them, even though classical logic insists each entails the other. The model represents inferential relevance, which is what reasoning actually needs, rather than the technical fact of mutual entailment among necessary truths.

## A worked example

Ask any person, "Does 1 + 1 = 2 prove triangles have three sides?" and they look at you strangely — the inference is valid yet useless. A search or recommendation model behaves the same way: it never surfaces "triangles have three sides" when you query basic arithmetic, because in its learned geometry the two ideas are unrelated. The lesson is that the relationship classical logic prizes most highly is not the one that drives useful inference. AI's looser, learned, relevance-tracking notion of connection is, for practical reasoning, the more valuable one.`,
  },
  {
    slug: "confirmation-vs-confidence",
    title: "Confirmation vs. Confidence Scores",
    weekNumber: 1,
    blurb: "Evidential support against numerical weighting — and why scores can mislead.",
    lectureTitle: "1.5 Confirmation vs. Confidence Scores: Evidential Support Against Numerical Weighting",
    body: `# Confirmation vs. Confidence Scores

Both classical logic and AI have a way of expressing "how strongly does the evidence back this conclusion?" They are easy to confuse and importantly different.

## The traditional view

Classical confirmation theory says A **confirms** B when B is *more likely given A than without it*. This is a relationship between propositions, grounded in evidential support, and it is meant to obey the rules of probability — confirming relationships are coherent, they compose predictably, and probabilities of mutually exclusive outcomes sum to one. Confirmation is about how evidence rationally raises or lowers the credibility of a hypothesis.

## The AI perspective

An AI system emits a **confidence score**: a number, usually presented in the range [0, 1]. It is tempting to read it as a probability, but it is not one. The score is **not necessarily normalized**, it is **context-dependent**, and it reflects **pattern strength rather than truth** or genuine evidential support. It need not follow probability rules — scores across exclusive options may not sum to one, and the same proposition can receive different scores in different contexts. Worst of all, a model can be **miscalibrated**: highly confident and wrong. The number looks like rigorous evidential weighting but is really a readout of how forcefully a learned pattern fired.

## A worked example

An image classifier labels a photo "wolf, 0.98." That 0.98 feels like "98% probability it's a wolf." But investigators have found classifiers that keyed on *snow in the background* rather than the animal, scoring confidently on snowy huskies and faltering on wolves photographed indoors. The confidence was high and the reasoning was wrong. **Calibration** — making the score actually match the chance of being correct — is its own hard engineering problem precisely because confidence and confirmation are not the same thing. Treat a model's number as pattern strength to be verified, not as evidential support you can bank on.`,
  },
  {
    slug: "ampliative-thesis",
    title: "The Ampliative Thesis",
    weekNumber: 1,
    blurb: "Inference that adds content, not merely reshuffles it — and why AI is ampliative by nature.",
    lectureTitle: "1.6 The Ampliative Thesis: Inference That Adds Content, Not Merely Reshuffles It",
    body: `# The Ampliative Thesis

Some inferences genuinely *add* information; others only rearrange what you already had. This distinction — **ampliative** versus **non-ampliative** — runs through the whole course.

## The traditional view

An inference is **ampliative** when the conclusion contains information not already present in the premises. It is **non-ampliative** (or *transformative*) when the conclusion merely makes explicit what the premises already contained. Classical logic struggles here. Deduction is standardly called non-ampliative: "all men are mortal; Socrates is a man; therefore Socrates is mortal" feels like it tells you nothing new — the conclusion was packed into the premises. Induction and abduction *are* ampliative — they reach beyond the evidence — but classical logic has always been uneasy about justifying them, since reaching beyond your premises is exactly what makes an inference risky.

## The AI perspective

AI systems are **inherently ampliative**. Combining patterns produces outputs that were not present in any single training example; context adds information to the base pattern; multiple partial matches each contribute something; and genuinely **emergent** properties arise from the combination. Training data *influences* outputs without *limiting* them — a generative model is built to produce things it never saw. Where classical logic agonizes over how an inference can legitimately add content, AI systems treat adding content as their default mode of operation.

## A worked example

Ask an image model for "an astronaut riding a horse on Mars." It never saw that image; it never could have. It composes the astronaut pattern, the horse pattern, the Martian-landscape pattern, and the riding relationship into something new. The output carries information present in no single premise — that is ampliative inference made concrete. The same faculty that lets the model create also lets it err, because anything that reaches beyond its evidence can reach wrong. Ampliative power and the risk of hallucination are two faces of one capability.`,
  },
  {
    slug: "knowledge-in-ai",
    title: "Knowledge in an AI System",
    weekNumber: 1,
    blurb: "What counts as knowing versus merely outputting the right words.",
    lectureTitle: "1.7 Knowledge in an AI System: What Counts as Knowing Versus Merely Outputting",
    body: `# Knowledge in an AI System

When a model produces a true statement, does it *know* that statement — or has it merely *output* it? The question is harder than it looks.

## The traditional view

The classical analysis of knowledge is **justified true belief**: you know that P when P is true, you believe it, and your belief is properly justified. Knowledge on this view is *propositional* (it concerns statements that are true or false), *truth-conditional*, and tied to having reasons. The famous Gettier problems show even this is not quite sufficient — you can have a justified true belief by luck and intuitively not *know* — but the core picture remains: knowing is more than producing the right answer; it requires the right relationship between believer, reason, and truth.

## The AI perspective

An AI system has no discrete beliefs to be justified. Its "knowledge" is **distributed across weights** — continuously varying, context-dependent, with fuzzy boundaries and emergent regularities rather than stored propositions. It can output a true sentence without anything that resembles believing it or having a reason for it. This is the heart of the **"stochastic parrot"** worry: a system that produces fluent, accurate text by modeling statistical structure may be *outputting* rather than *knowing*. Yet it can also generalize, apply regularities to genuinely new cases, and correct itself — behaviors we normally treat as marks of understanding. Where the line falls is genuinely unsettled.

## A worked example

A model answers "The capital of Australia is Canberra" — correct, and a common trap, since many expect "Sydney." Did it *know*? It has no justified belief; it has weights that make "Canberra" the high-probability completion. Now suppose a different model outputs the same true sentence because its training data happened to be noisy in a way that cancelled out to the right answer — true output, no reliable basis, an AI echo of the Gettier problem. The practical upshot is the same caution as the confidence lecture: a correct output is not proof of knowledge, so verify rather than assume the system *knows*.`,
  },
  {
    slug: "anti-skeptical-epistemology",
    title: "AI and Anti-Skepticism",
    weekNumber: 1,
    blurb: "Why working AI vindicates anti-skeptical epistemology rather than threatening it.",
    lectureTitle: "1.8 Why AI Vindicates Anti-Skeptical Epistemology Rather Than Threatening It",
    body: `# Why AI Vindicates Anti-Skeptical Epistemology

A natural fear is that AI, with its hallucinations and miscalibrated confidence, *strengthens* the skeptic's case — that nothing can really be known. This lecture argues the opposite.

## The traditional debate

The **skeptic** demands certainty: if a belief could possibly be mistaken, the skeptic says, it does not count as knowledge. Because almost any belief *could* be wrong, skepticism threatens to dissolve knowledge entirely. The **anti-skeptical** (or *fallibilist*) reply is that knowledge never required infallible foundations. We know things through **reliable processes** that usually get it right, even though they can occasionally fail. Knowledge is a matter of reliability, not of immunity to error. This is the same ampliative spirit from earlier: useful inference reaches beyond what is certain.

## The AI perspective

A working AI system is a *standing demonstration* of the anti-skeptical view. It has no certain foundations, no infallible premises, no guarantee on any single output — and yet it reliably succeeds at recognition, translation, prediction, and navigation, often at superhuman rates. If knowledge required certainty, these systems could never be said to get anything right; they would be epistemic noise. That they *do* reliably succeed shows that productive, knowledge-like performance is possible **without** certainty — exactly the fallibilist's claim. The AI's errors are not a refutation of knowledge; they are the expected price of any ampliative, reliable-but-fallible process.

## A worked example

A self-driving car's perception system cannot be *certain* the shape ahead is a pedestrian — fog, glare, and odd angles all introduce doubt. The skeptic concludes it can never *know* there is a pedestrian. Yet the system identifies pedestrians reliably enough to drive millions of miles more safely than many humans. Its success despite irreducible uncertainty is precisely what the anti-skeptic predicted: reliability, not certainty, is what knowledge and competent action actually run on. AI does not hand victory to the skeptic — it quietly settles the argument against them.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Unit 2 — Notational Conventions for AI Logic
  // ───────────────────────────────────────────────────────────────
  {
    slug: "why-new-notation",
    title: "Why AI Logic Needs Its Own Notation",
    weekNumber: 2,
    blurb: "Classical symbols encode binary rules; AI reasoning needs new marks.",
    lectureTitle: "2.1 Why AI Logic Needs Its Own Notation",
    body: `# Why AI Logic Needs Its Own Notation

Classical logic gave us a precise shorthand. To talk clearly about AI reasoning, we need a parallel set of symbols — and to understand *why* the old ones do not transfer.

## The classical toolkit

Traditional logic introduced compact operators: **P → Q** ("if P then Q," strict implication), **P ↔ Q** (biconditional), **~P** (negation), **□P** (necessity), **◊P** (possibility). Each encodes a *rule-based, binary* relationship. P → Q is either valid or it is not; it holds in every context or it fails; and its meaning was *defined* by a logician, not learned. This notation is perfect for a world of fixed rules and truth values.

## Why it does not fit AI

AI reasoning violates every assumption baked into those symbols. Its relationships are **fuzzy**, not binary; **context-sensitive**, not universal; **learned from data**, not defined; and sometimes **inconsistent**, giving different results on different runs. Writing "doctor → hospital" with the classical arrow would assert a strict logical implication that simply is not there. The arrow has no way to say "this association is strong but defeasible, holds in most contexts, varies in strength, and was learned rather than stipulated." We need symbols whose very shape reminds us of these differences.

## The new marks

So AI logic adopts a parallel vocabulary, developed across this unit: **P ⇒ Q** for *pattern activation* (P activates Q, fuzzily and contextually), **P ≈ Q** for *similarity* in embedding space, **C(P)** for a *confidence score*, and **P ▷ Q** for a *chain-of-thought step*. These are deliberately distinct from →, ↔, and ~ so that no one mistakes a learned, graded, revisable association for a strict logical law. Good notation is not decoration; it is a discipline that keeps you honest about what kind of relationship you are actually claiming.`,
  },
  {
    slug: "defeasible-inference",
    title: "Representing Defeasible Inference",
    weekNumber: 2,
    blurb: "Notation for conclusions that can later be withdrawn.",
    lectureTitle: "2.2 Representing Defeasible Inference: Conclusions That Can Be Withdrawn",
    body: `# Representing Defeasible Inference

A **defeasible** inference is one whose conclusion you are entitled to draw *now* but might have to *withdraw* later when more is known. AI logic needs a way to mark such inferences as provisional.

## The idea

Classical implication is permanent: once P → Q is established and P holds, Q holds forever. Defeasible inference is different. From "Tweety is a bird" you reasonably conclude "Tweety flies" — but this is a *default*, not a guarantee. Learn that Tweety is a penguin, and the conclusion is **defeated** and retracted. The original inference was not a mistake; it was the right move on the information available, later overridden. Almost all everyday reasoning, and nearly all AI reasoning, works this way.

## The notation

We write a defeasible link with the pattern-activation arrow, **P ⇒ Q**, deliberately *not* the strict P → Q, to signal that the conclusion is provisional and **subject to defeat**. We can name the conditions that would withdraw it — its **defeaters**. "Bird ⇒ flies" carries an implicit "...unless penguin, ostrich, injured, caged." The arrow that can be withdrawn is the workhorse of AI logic; the arrow that cannot (→) is the rare special case.

## A worked example

A medical triage model infers, from a high temperature, "⇒ likely infection." That is a sound default. Then it ingests a note that the patient just finished intense exercise in the heat — a defeater — and it lowers or withdraws the infection conclusion. Nothing went wrong: a defeasible inference was made and then properly defeated by new evidence. Marking the step with ⇒ rather than → tells every later reader, and every later stage of the system, that this conclusion was always open to revision. Treating defeasible conclusions as if they were strict implications is one of the most common errors in reasoning about AI.`,
  },
  {
    slug: "non-monotonic-reasoning",
    title: "Encoding Non-Monotonic Reasoning",
    weekNumber: 2,
    blurb: "When adding premises subtracts conclusions.",
    lectureTitle: "2.3 Encoding Non-Monotonic Reasoning: When Adding Premises Subtracts Conclusions",
    body: `# Encoding Non-Monotonic Reasoning

Defeasibility has a precise structural name: **non-monotonicity**. It is one of the deepest formal differences between classical and AI logic.

## Monotonic vs. non-monotonic

Classical logic is **monotonic**: adding premises can only ever *add* conclusions, never remove them. If your premises entail Q, then those premises *plus anything else* still entail Q. More information never costs you a conclusion. AI reasoning is **non-monotonic**: adding a premise can *subtract* a conclusion you previously held. This is exactly defeasibility viewed as a property of the whole system rather than of one inference. Real reasoning is non-monotonic, which is why classical logic, for all its rigor, is a poor model of how anyone — or any neural network — actually thinks.

## Encoding it

The notation must show that a conclusion depends on the *absence* of certain other facts. We write conclusions as defeasible (⇒) and attach the assumptions they rest on, so that introducing a defeater visibly cancels the link. A useful gloss: "from {bird} conclude flies; from {bird, penguin} do **not** conclude flies." The conclusion set *shrank* when the premise set *grew* — the signature of non-monotonic reasoning, impossible to express with the monotone classical arrow.

## A worked example

Tell a reasoning system only "Tweety is a bird" and it concludes "Tweety flies." Now *add* the true premise "Tweety is a penguin." A monotonic system would still owe you "Tweety flies" — absurdly, since you gave it strictly more correct information. A non-monotonic system instead *drops* "flies." Notice the paradox from the classical standpoint: supplying more truth removed a conclusion. Any honest notation for AI must make this not just possible but natural, because language models, planners, and perception systems all revise conclusions the instant disqualifying context arrives.`,
  },
  {
    slug: "semantic-network-notation",
    title: "Semantic Networks and Embedding Space",
    weekNumber: 2,
    blurb: "Notation for similarity and relationships in vector space.",
    lectureTitle: "2.4 Notation for Semantic Networks and Embedding-Space Relationships",
    body: `# Notation for Semantic Networks and Embedding-Space Relationships

Much of what an AI system "knows" is *where things sit relative to each other*. We need notation for relationships of similarity and position, not just of implication.

## Similarity as a first-class relation

We write **P ≈ Q** to mean "patterns P and Q are *similar* in the embedding space." Crucially, similarity is **measured**, typically by cosine distance between vectors, so it is continuous (degrees of similarity, not yes/no), context-dependent, and *learned* rather than defined. Similarity also need not be perfectly symmetric or transitive: P ≈ Q and Q ≈ R do **not** guarantee P ≈ R, because closeness can drift across a high-dimensional space. This already breaks a rule any classical equivalence relation would obey.

## Networks of meaning

Embeddings turn meaning into **geometry**. Related concepts cluster; unrelated ones lie far apart; and directions in the space can encode relationships. The notation lets us state structural facts a classical vocabulary cannot, such as "the step from *king* to *queen* is roughly the same vector as the step from *man* to *woman*." Meaning here is *relational and spatial* — a thing means what it means partly by *where it is* among everything else.

## A worked example

The celebrated result **king − man + woman ≈ queen** is exactly this notation in action. The model learned vector positions such that subtracting the "man" direction and adding the "woman" direction moves you from *king* to the neighborhood of *queen*. No rule of classical logic can express that; ≈ and vector arithmetic can. This is why embedding-space notation matters: it captures the actual currency of modern AI — graded, geometric, learned relationships among meanings — rather than forcing them into the binary mold of implication.`,
  },
  {
    slug: "marking-confidence",
    title: "Marking Confidence and Strength",
    weekNumber: 2,
    blurb: "Annotating the strength of support inside an inference.",
    lectureTitle: "2.5 Marking Confidence and Strength of Support Within an Inference",
    body: `# Marking Confidence and Strength of Support Within an Inference

In classical logic an inference either holds or it does not — there is nothing to quantify. In AI logic, *strength* is part of the content, so the notation has to carry it.

## Confidence as annotation

We write **C(P)** for the system's confidence in P, a value in [0, 1] — but, as Unit 1 stressed, not a true probability. We can annotate an activation with its strength: **P ⇒[0.8] Q** reads "P activates Q with strength 0.8." This makes explicit that the *same* link can fire weakly or strongly depending on context, and that two inferences from the same premise can carry very different weights. The number is a readout of pattern strength, to be calibrated and checked, not a guarantee.

## Strength propagates — imperfectly

Strength behaves unlike probability when inferences combine. Along a chain, **confidence typically decays**: if P ▷ Q and Q ▷ R, the support for R is usually weaker than for either step, because uncertainty compounds. Combining patterns is *not* simple multiplication — **C(P ⊕ Q) ≠ C(P) × C(Q)** — since patterns can reinforce or interfere. And alternatives can pool: the confidence of "P or Q" may exceed the larger of the two. The notation's job is to keep these graded, non-probabilistic behaviors visible rather than letting them masquerade as clean arithmetic.

## A worked example

A document classifier reports "contract ⇒[0.55] employment-agreement" and, on a longer reasoning chain, "clause ▷ obligation ▷[0.4] penalty." The annotations tell a reviewer exactly where the system is shaky: the 0.55 is barely a lean, and the penalty conclusion, two hops down a decaying chain, deserves human eyes. Strip the numbers and every step looks equally authoritative. Marking strength is what turns an opaque verdict into an auditable inference — you can see not just *what* the system concluded but *how hard* each link actually pulled.`,
  },
  {
    slug: "syntax-semantics-collapse",
    title: "The Syntax/Semantics Collapse",
    weekNumber: 2,
    blurb: "Where the classical divide between form and meaning breaks down.",
    lectureTitle: "2.6 The Syntax/Semantics Collapse: Where the Classical Divide Breaks Down",
    body: `# The Syntax/Semantics Collapse

Classical logic rests on a clean separation between **syntax** (form) and **semantics** (meaning). In AI systems that wall comes down — and the notation has to acknowledge it.

## The classical divide

Traditional logic keeps two kinds of relationship strictly apart. **Formal (syntactic) entailment** holds between *expressions* by structure alone: "Snow is white and grass is green" entails "Snow is white" purely from the shape of the conjunction, regardless of meaning. **Model-theoretic (semantic) entailment** holds between *propositions* in virtue of truth conditions. Form is manipulated by rules; meaning is supplied separately by an interpretation. The whole architecture of classical logic depends on never confusing the two.

## The collapse

In an embedding space, **expressions and meanings live in the same place**. A token's vector encodes its form *and* its learned meaning together; structural patterns and semantic patterns interact continuously; context modifies both at once. There is no separate "interpretation" bolted on after the syntax — the model learned form and meaning *jointly* from the same data. So the classical question "is this a syntactic or a semantic relationship?" often has no answer. The notation responds by using one unified space (≈, ⇒) for relationships that classical logic would have split across two incompatible vocabularies.

## A worked example

When a language model handles "The trophy didn't fit in the suitcase because it was too big," resolving *it* to the trophy is, classically, ambiguous: pure syntax permits either referent, and only world-meaning settles it. The model does not run syntax first and semantics second. The same attention computation that tracks grammatical structure also weighs which referent makes the sentence *mean* something sensible. Form and meaning are computed in one pass, in one space. That fusion is a genuine break from classical logic, and pretending the old divide still holds will mislead anyone trying to describe how the system actually reasons.`,
  },
  {
    slug: "transformative-vs-ampliative-notation",
    title: "Transformative vs. Ampliative Steps",
    weekNumber: 2,
    blurb: "Marking which steps reshuffle content and which steps add it.",
    lectureTitle: "2.7 Distinguishing Transformative From Ampliative Steps in Notation",
    body: `# Distinguishing Transformative From Ampliative Steps in Notation

The ampliative/non-ampliative distinction from Unit 1 is so important that the notation should make it visible *step by step*. Which moves merely rearrange, and which actually add content?

## Two kinds of step

A **transformative** step makes explicit something already contained in what you had — it reshuffles, it does not add. Classical deduction is the paradigm: writing it with a turnstile, **P ⊢ Q**, signals "Q was already implicit in P; this step extracts it." An **ampliative** step reaches beyond its inputs to introduce genuinely new content. We mark it with the chain/generation arrow, **P ▷ Q**, signaling "Q is generated *from* P but carries information P did not contain." The shapes differ because the epistemic risk differs: transformative steps preserve truth, ampliative steps can introduce error.

## Why the marking matters

Mixing the two silently is dangerous. A long argument may look uniformly rigorous while smuggling an ampliative leap into the middle dressed as deduction. By forcing every step to declare itself — ⊢ for transformative, ▷ for ampliative — the notation lets a reader locate exactly where the reasoning *added* something and therefore exactly where it *could be wrong*. Truth flows safely across ⊢ links; across ▷ links it is only ever probable, and confidence decays. The marks turn "is this conclusion trustworthy?" into the answerable "how many ▷ steps did it pass through?"

## A worked example

A model solves a word problem: it ▷-infers from the prose that "the train's speed is constant" (an ampliative reading that adds an assumption not stated), then ⊢-derives "distance = speed × time" (a transformative algebra step), then ▷-estimates a numeric answer. If the result is wrong, the notation points straight at the ▷ steps — most likely the unstated constant-speed assumption — not at the arithmetic. Auditing AI reasoning is largely the work of finding the ampliative steps and checking them, and notation that hides them makes that work impossible.`,
  },
  {
    slug: "limits-of-formalization",
    title: "The Limits of Formalization",
    weekNumber: 2,
    blurb: "What the notation can and cannot capture.",
    lectureTitle: "2.8 The Limits of Formalization: What the Notation Can and Cannot Capture",
    body: `# The Limits of Formalization

Having built a notation for AI logic, intellectual honesty requires admitting what it *cannot* do. The symbols are a useful approximation, not a complete formal system.

## Why the notation is necessarily approximate

AI systems operate on principles that differ fundamentally from the discrete, rule-based world notation was invented for. Three features resist capture. **Context-dependence** is pervasive: every operator's meaning shifts with surroundings, so no fixed symbol fully pins it down. **Emergence** means novel patterns and capabilities arise from combination that were not present in the parts — and notation built from those parts cannot anticipate them. And the systems can be **inconsistent**, returning different results for the same input, which any tidy formal calculus assumes away.

## What it can and cannot do

The notation *can* do real work: it forces clarity about whether a link is strict or defeasible, transformative or ampliative; it makes strength and context visible; it keeps you from mistaking learned association for logical law. What it *cannot* do is fully specify a transformer's attention, capture multi-modal reasoning across text and images and sound, or formalize context-dependence completely. Open questions remain genuinely open: can AI reasoning be fully formalized at all? How should we represent uncertainty versus confidence, or emergence and novelty? Treat the notation as a disciplined lens, not a complete theory.

## A worked example

Write "joke-setup ⇒ punchline" and you have captured *that* one pattern activates another — but nothing in the notation explains *why a particular punchline is funny*, the emergent, context-soaked property that made the model's output land. Humor, taste, surprise, and the felt aptness of a metaphor are real products of these systems and slip through every symbol we have. The map is not the territory. The right stance is the same fallibilism from Unit 1: use the formalism for the clarity it gives, and stay humble about the large, important parts of AI reasoning that no notation yet reaches.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Unit 3 — Meta-Logical Principles
  // ───────────────────────────────────────────────────────────────
  {
    slug: "what-is-metalogical-principle",
    title: "What a Meta-Logical Principle Is",
    weekNumber: 3,
    blurb: "Principles about a logic itself — and why AI logic has its own.",
    lectureTitle: "3.1 What a Meta-Logical Principle Is and Why AI Logic Has Its Own",
    body: `# What a Meta-Logical Principle Is and Why AI Logic Has Its Own

So far we have studied *inferences* and the *notation* for them. Now we step up a level: to principles about the system of inference as a whole.

## Object level vs. meta level

A rule like modus ponens — "from P and P → Q, infer Q" — operates *inside* a logic; it is an **object-level** rule. A **meta-logical principle** is a statement *about* the logic itself: that it is sound, that it is complete, that it is consistent. Meta-logic does not draw conclusions within the system; it characterizes the system's behavior and guarantees. Soundness ("you can only derive true things"), completeness ("you can derive every true thing"), and consistency ("you cannot derive a contradiction") are the classic examples — properties of the whole apparatus, proved from outside it.

## Why AI logic needs its own

You cannot judge AI reasoning by classical meta-logic, because classical meta-logic presupposes exactly what AI abandons: discreteness, monotonicity, fixed rules, binary truth. Asking whether a neural network is "complete" in the classical sense is a category error. AI logic therefore needs *reconceived* meta-logical principles fit for an **ampliative, defeasible, learned** system — principles about reliability, calibration, defeasibility, consistency under revision, and rules that themselves change. This unit develops them. The move is the same one classical logicians made: once you have a logic, you ask what can be said about it as a whole.

## A worked example

"This sorting algorithm is correct" is an object-level claim about one procedure; "every program in this language either halts or runs forever" is a meta-level claim about the whole language. Likewise, "the model labeled this image *cat*" is object-level, while "the model's confidence scores are well-calibrated across all classes" is meta-level — a property of the system, not of any single output. The rest of Unit 3 is about getting those system-level claims right for AI, because that is where trust, evaluation, and safety actually live.`,
  },
  {
    slug: "soundness-completeness-reconceived",
    title: "Soundness and Completeness Reconceived",
    weekNumber: 3,
    blurb: "Recasting the classic guarantees for ampliative systems.",
    lectureTitle: "3.2 Soundness and Completeness Reconceived for Ampliative Systems",
    body: `# Soundness and Completeness Reconceived for Ampliative Systems

The two crown jewels of classical meta-logic are **soundness** and **completeness**. Neither survives contact with AI unchanged — but each has a meaningful successor.

## The classical pair

A system is **sound** if every conclusion it can derive is actually true: it never proves a falsehood. It is **complete** if every truth (in its domain) can be derived: it never misses a theorem. Sound and complete together is the dream — exactly the true statements, no more, no less. Classical propositional and first-order logic achieve this. The guarantees are absolute because the system is transformative: deduction only makes explicit what was already there, so it can be made to never overshoot and never fall short.

## Why ampliative systems cannot have them

An ampliative system reaches *beyond* its premises, so it *can* derive falsehoods — soundness in the strict sense is impossible; that is the price of adding content. And there is no fixed set of truths it is meant to exhaust, so classical completeness does not even apply. The honest replacements are statistical. **Soundness becomes reliability and calibration**: not "never wrong" but "wrong rarely, and confident in proportion to how often it is right." **Completeness becomes coverage and generalization**: not "derives every truth" but "performs well across the full range of real inputs, including ones it never saw."

## A worked example

A spam filter cannot be classically sound — it will sometimes flag a real email — nor complete, since new spam is invented daily. Judging it by those standards declares every useful filter a failure. Judge it instead by its reconceived successors: a **false-positive rate** (its analog of soundness — how often it wrongly condemns the innocent) and a **recall** rate (its analog of completeness — how much real spam it catches), plus whether its confidence is calibrated. Those are the meta-logical guarantees an ampliative system can actually offer, and they are the ones worth measuring.`,
  },
  {
    slug: "defeasibility-governing-principle",
    title: "Defeasibility as a Governing Principle",
    weekNumber: 3,
    blurb: "In AI logic, defeasibility is the rule, not the exception.",
    lectureTitle: "3.3 Defeasibility as a Governing Principle, Not an Exception",
    body: `# Defeasibility as a Governing Principle, Not an Exception

In Unit 2 defeasibility was a feature of individual inferences. At the meta level it becomes something larger: the **governing principle** of the whole system.

## A reversal of status

Classical logic treats withdrawable conclusions as an *anomaly* — a defect to be patched, a place where strict logic must be supplemented with special "default rules." The strict, permanent implication is the citizen; the defeasible inference is the exception begging for accommodation. AI logic **reverses this entirely**. Here defeasibility is the norm and strict, indefeasible implication is the rare special case. Almost every conclusion a model draws is a default held open to revision; the handful that are genuinely indefeasible (like trivial structural truths) are the exceptions. What was peripheral becomes central.

## Why the reversal is right

This is not a stylistic preference; it reflects how learned systems must work. A system that learns from data and acts in an open world will *always* face new information that overturns prior conclusions, so building it around permanent commitments would be a design error. Making defeasibility the governing principle means the system is *expected* to revise, evaluated on *how well* it revises, and never embarrassed by having to take something back. Robustness is reframed: a good system is not one that never withdraws a conclusion but one that withdraws the right conclusions at the right time.

## A worked example

A navigation app routes you down Main Street — a confident, sensible conclusion. Then a crash closes the road, and it instantly reroutes. A classical system would regard this retraction as a breakdown of its logic; the app regards it as *working exactly as designed*. Its entire value rests on treating every route as a defeasible default, ready to be overridden the moment conditions change. Elevating defeasibility from exception to governing principle is what lets AI operate in a world that refuses to hold still.`,
  },
  {
    slug: "consistency-under-revision",
    title: "Consistency Under Revision",
    weekNumber: 3,
    blurb: "Holding a system together as its beliefs change.",
    lectureTitle: "3.4 Consistency Under Revision: Holding a System Together as Beliefs Change",
    body: `# Consistency Under Revision

If conclusions are constantly withdrawn and replaced, what keeps the system from falling into incoherence? The meta-logical principle here is **consistency under revision**.

## The classical view of consistency

Classically, **consistency** is static: a set of beliefs is consistent if it contains no contradiction, full stop. And classical logic is brittle about contradiction — under the principle of *explosion*, a single contradiction lets you derive *everything*, so one inconsistency destroys the entire system. Consistency is something you establish once for a fixed set of statements and then preserve by never adding anything that clashes.

## Consistency as a dynamic achievement

In a learning, revising system, beliefs change every moment, so consistency cannot be a one-time check — it must be **maintained dynamically** as information arrives. The relevant question is not "is the belief set contradiction-free right now?" but "when new evidence conflicts with old conclusions, does the system *revise gracefully* — giving up the least it must, keeping what still stands, and not collapsing?" Crucially, AI systems do **not** explode from local contradictions; they tolerate competing patterns and let context arbitrate, so a single conflict stays contained instead of poisoning everything. Consistency becomes a property of the *revision process*, not of a frozen snapshot.

## A worked example

A recommendation system believes you love action films. You then binge three documentaries. A brittle, classical-style system might see "loves action" and "loves documentaries" as a contradiction to resolve by overwriting one with the other. A system built for consistency under revision instead *holds both*, weights them by recency and strength, and quietly updates your profile — no collapse, no thrashing, just graceful incorporation of conflicting evidence. Holding together *while* changing, rather than freezing to stay coherent, is the meta-logical discipline that lets AI systems live in a stream of contradictory data.`,
  },
  {
    slug: "pattern-recognition-primitive",
    title: "Pattern Recognition as a Primitive",
    weekNumber: 3,
    blurb: "Pattern recognition as the basic inferential operation.",
    lectureTitle: "3.5 The Role of Pattern Recognition as an Inferential Primitive",
    body: `# The Role of Pattern Recognition as an Inferential Primitive

Every logic is built on some *primitive* operation — the atomic move from which all reasoning is composed. Identifying AI logic's primitive tells you what kind of system it really is.

## The classical primitive

In classical logic the primitive is the application of an **inference rule** to symbols: modus ponens, and-elimination, and the rest. Reasoning is the repeated, mechanical application of such rules to well-formed formulas. Everything reduces to rule-following over discrete symbols; meaning and similarity are not operations the logic performs — they are supplied from outside. The primitive is *syntactic rule application*.

## Pattern recognition as the AI primitive

In AI logic the primitive is **pattern recognition**: matching an input against learned regularities and activating what is similar. This is not built up from rules — it is the floor, the thing everything else is made of. Chains of thought, classifications, generations, analogies are all elaborations of "recognize the pattern, activate the associated pattern." Treating pattern recognition as a *genuine inferential primitive*, rather than as a mere preprocessing step before "real" logical reasoning begins, is the central meta-logical commitment of AI logic. It says similarity-driven activation is itself a way of reasoning, not a substitute for it.

## A worked example

A radiologist's AI "infers" a tumor from a scan. There is no rule "if pixel-pattern X then tumor" that a logician wrote down. The system recognizes that this image's pattern is similar to patterns labeled *tumor* in training, and activates that conclusion. That single act of recognition *is* the inference — the atom from which the diagnosis is built. Once you accept pattern recognition as a legitimate primitive, the apparent gap between "mere statistics" and "real reasoning" narrows: in AI logic, recognizing the pattern is reasoning, performed at the most basic level the system has.`,
  },
  {
    slug: "screening-defeat-override",
    title: "Screening, Defeat, and Override",
    weekNumber: 3,
    blurb: "How competing inferences are arbitrated.",
    lectureTitle: "3.6 Screening, Defeat, and Override Among Competing Inferences",
    body: `# Screening, Defeat, and Override Among Competing Inferences

Because AI reasoning is defeasible and many patterns activate at once, conflicts are constant. The meta-logic of *how conflicts get resolved* is the subject here.

## Three ways one inference yields to another

When inferences compete, three relationships matter. **Defeat**: new information directly cancels a conclusion — a *rebutting* defeater gives positive reason for the opposite, while an *undercutting* defeater removes the support for the original without arguing the contrary. **Screening off**: one factor makes another irrelevant, so once the screening factor is known, the screened factor no longer changes the conclusion. **Override**: a stronger pattern simply wins over a weaker one when both fire, the higher-confidence activation dominating the output. Real systems use all three to turn a clamor of partial activations into a single coherent answer.

## Why arbitration is meta-logical

Deciding *which* inference prevails is not itself an object-level inference — it is a principle about how the system handles its own internal conflicts. A well-behaved system has consistent arbitration: defeaters reliably defeat, stronger evidence reliably overrides, and irrelevant factors are reliably screened off. A badly behaved one is swayed by whichever pattern happens to shout loudest, producing erratic, manipulable behavior. Much of AI safety is really about making screening, defeat, and override trustworthy.

## A worked example

A content-moderation model sees a post containing a slur and leans "⇒ remove." Then context arrives: the post is a news report *quoting* the slur to condemn it. That context is an **undercutting defeater** — it removes the basis for removal without claiming the word is fine — and it also **screens off** the raw keyword match, which should no longer drive the decision. A system with sound arbitration keeps the post up; one without it removes legitimate journalism. The keyword still activated; what matters, meta-logically, is that the system resolved the conflict correctly.`,
  },
  {
    slug: "classical-logic-transformative",
    title: "Why Classical Logic Is Transformative",
    weekNumber: 3,
    blurb: "Classical logic only reshuffles content — and what follows from that.",
    lectureTitle: "3.7 Why Classical Logic Is Merely Transformative — And What Follows",
    body: `# Why Classical Logic Is Merely Transformative — And What Follows

This lecture states the unit's sharpest thesis: classical logic is **merely transformative**, and recognizing this reframes the relationship between classical and AI logic.

## The thesis

Classical deduction never adds content. Its conclusions only make explicit what the premises already contained — it *reshuffles* information rather than *generating* it. "All men are mortal; Socrates is a man; therefore Socrates is mortal" extracts something packed into the premises and tells you nothing genuinely new about the world. This is the **non-ampliative** character of deduction, now stated as a property of classical logic *as a whole*: every valid deductive step is transformative. That is precisely why deduction can be perfectly truth-preserving — it never risks anything by reaching beyond its inputs.

## What follows

Two consequences matter. First, **classical logic alone cannot learn**. A purely transformative system can rearrange what it is given but can never acquire genuinely new content from experience — and learning is exactly the acquisition of new content. So no amount of pure deduction yields a system that grows from data. Second, **ampliative inference is indispensable**, not a poor relation of deduction but the only kind that adds knowledge. The classical tradition's habit of treating deduction as the ideal and induction as the embarrassment gets the priorities backward for any system meant to learn about the world. Transformative reasoning is safe but sterile; ampliative reasoning is risky but generative.

## A worked example

A calculator is flawlessly transformative: it rearranges the numbers you enter into their sum, with perfect reliability, forever — and it never learns anything, because it never adds content. A child learning that fire is hot does something a calculator categorically cannot: she acquires *new* information from the world through an ampliative, fallible inference. AI systems are built to be that child, not that calculator. Understanding classical logic as merely transformative is what explains why AI had to be ampliative — and why its power and its fallibility are inseparable.`,
  },
  {
    slug: "metalogic-of-learning",
    title: "The Meta-Logic of Learning",
    weekNumber: 3,
    blurb: "Inference rules that themselves update with experience.",
    lectureTitle: "3.8 The Meta-Logic of Learning: Inference Rules That Themselves Update",
    body: `# The Meta-Logic of Learning

The deepest meta-logical difference comes last. In classical logic the inference rules are *fixed*. In AI logic, the rules themselves **change with experience**.

## Fixed rules vs. self-updating rules

Classical logic's rules — modus ponens and the rest — are permanent. They are given in advance, identical for every problem, and never altered by use; reasoning happens *within* a frame that does not move. AI systems invert this. The system's effective inference rules are encoded in its **weights**, and training **changes those weights** — so the very rules by which the system draws conclusions are *learned and revised* from data. The system does not just reach conclusions inside fixed rules; it rewrites the rules in light of experience. This is the meta-logic of learning: a logic whose object-level machinery is itself the product of an ampliative process.

## Why this is a meta-logical fact

That rules update is not a conclusion drawn *inside* the system — it is a property *of* the system, hence meta-logical. It also closes the loop of this unit. Defeasibility, consistency under revision, and reliability-not-soundness all presuppose a system that *changes*; the meta-logic of learning explains where that change ultimately lives: not merely in which conclusions are held, but in the inference rules themselves. A learning system is one whose logic is perpetually under construction by its own experience.

## A worked example

A spam filter retrained each week is literally revising its inference rules: last month "contains the word *crypto*" weakly suggested spam; after a wave of crypto scams, the same feature now strongly does. No human rewrote a rule — the weights shifted as data accumulated, so the system's logic for what-implies-spam evolved on its own. A classical rule-based filter would need a programmer to hand-edit its rules; the learning system edits them itself. Inference rules that update in light of experience are the formal signature of learning — and the final reason AI logic is a different kind of logic, not just classical logic with noise.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Unit 4 — Models
  // ───────────────────────────────────────────────────────────────
  {
    slug: "what-is-a-model",
    title: "What a Model Is in AI Logic",
    weekNumber: 4,
    blurb: "From interpretations that satisfy sentences to the learned system itself.",
    lectureTitle: "4.1 What a Model Is in AI Logic",
    body: `# What a Model Is in AI Logic

The word **model** means something precise in classical logic — and something almost unrecognizably different in AI. Getting the shift straight is the key to this final unit.

## The classical model

In logic, a **model** is an *interpretation*: an assignment of values to the variables of open sentences that makes those sentences come out **true**. Take two open sentences — (1) "x is an even number greater than zero" and (2) "x² is less than 20." A model is an assignment, such as x = 2 or x = 4, that *satisfies* both. The model is external to the sentences, discrete, binary (it satisfies them or it does not), context-independent, and a matter of pure symbolic checking. A model, classically, is a way the world could be that makes your statements true.

## The AI model

In AI, the **model is the neural network itself**. It is not an external interpretation that satisfies sentences; it is a *learned function* whose weights and biases *are* its "interpretation" of the data. Truth values give way to **continuous activation patterns**; fixed satisfaction conditions give way to behavior that **context modifies dynamically**; and crucially the model is **learned**, not stipulated, with many partial interpretations coexisting inside it. Where a classical model is something you *check* a sentence against, an AI model is something you *run* an input through. Same word, two different objects: one a static interpretation, the other a dynamic learned system.

## A worked example

Classically, to model "x is even and x² < 20" you hunt for satisfying values — 2 and 4 — and the model is just that assignment. In AI, to "model" handwritten digits you *train a network* on thousands of labeled images until its weights embody the regularities of how digits look; the model is the trained network, and you use it by feeding in a new image and reading the activations. The classical model answers "what makes this sentence true?"; the AI model answers "given this input, what output do my learned weights produce?" The rest of Unit 4 unpacks that second kind of model.`,
  },
  {
    slug: "neural-networks-as-models",
    title: "Neural Networks as Models",
    weekNumber: 4,
    blurb: "The network-as-model reconception.",
    lectureTitle: "4.2 Neural Networks as Models: The Network-as-Model Reconception",
    body: `# Neural Networks as Models: The Network-as-Model Reconception

The previous lecture said the AI model *is* the network. This one takes that reconception seriously and works out what it implies.

## Weights as interpretation

Classically, an interpretation lives outside the sentences and assigns them meaning. In a neural network, the **weights and biases play the role of the interpretation** — they encode how inputs are mapped to outputs, which is the network's entire "understanding" of its domain. A fresh network with random weights interprets nothing; training tunes the weights until the network embodies a useful interpretation of the data. There is no separate interpreting agent: the parameters *are* the interpretation, baked into the same object that does the computing. This fuses two things classical logic kept apart — the system and its interpretation become one.

## Validation becomes continuous

Because the model is a network, its outputs are **continuous activations**, not binary satisfaction. "Does the model satisfy this?" has no yes/no answer; instead there are degrees, and **multiple partial interpretations coexist**. Validation shifts accordingly: not "is the interpretation correct?" but "how well does the network's behavior match reality across many inputs?" The network-as-model is evaluated *statistically and behaviorally*, by what it does on data, rather than *logically*, by whether a fixed interpretation satisfies a fixed sentence.

## A worked example

A sentiment model reads "the movie was a masterpiece" and outputs 0.93 positive. The 0.93 is an activation, not a truth value, and it came from the weights — the learned interpretation — applied to the input. Change the weights (retrain on sarcasm-heavy data) and the *same sentence* yields a different reading: the interpretation lives in the parameters and moves when they move. There is no external model satisfying a sentence here; there is a network whose weights constitute its interpretation and whose activations constitute its verdict. That is the network-as-model reconception in a single forward pass.`,
  },
  {
    slug: "embedding-spaces-as-models",
    title: "Embedding Spaces as Semantic Models",
    weekNumber: 4,
    blurb: "Meaning as geometry; distance as similarity.",
    lectureTitle: "4.3 Embedding Spaces as Semantic Models",
    body: `# Embedding Spaces as Semantic Models

If weights are the interpretation, the **embedding space** is where that interpretation becomes *meaning you can navigate*. It is the AI counterpart to the classical universe of discourse.

## Meaning as geometry

Classically, semantics is supplied by a fixed domain of objects and an assignment of terms to them. An AI system instead places every concept as a **vector in a continuous high-dimensional space**, learned from data. Meaning becomes **geometry**: similar concepts sit close together, unrelated ones far apart, and *directions* in the space encode relationships. The space is the system's semantic model — not a set of objects with labels attached, but a landscape where position *is* meaning and distance *is* similarity. Nothing was defined; the whole geometry was learned from how things co-occur.

## A genuinely different kind of model

This semantic model has properties the classical one cannot. It is **continuous** (between any two meanings lie intermediate points), **context-sensitive** (the same word can shift position with surrounding text), and **relational** (a concept's meaning is fixed by where it stands relative to everything else, not by an intrinsic definition). Where classical model theory asks "which objects does this term denote?", embedding-space semantics asks "where does this meaning sit, and what is near it?" Meaning is location and neighborhood rather than denotation.

## A worked example

In a trained embedding space, *Paris* sits near *France*, *London* near *England*, and the *Paris → France* direction roughly equals the *London → England* direction — so the "capital-of" relationship is a *direction* in the geometry, not a stored rule. A search engine exploits this: ask for "the city of light" and it returns Paris because the query lands in Paris's neighborhood, even with no shared keywords. The embedding space is doing the work a classical model of meaning never could — representing graded, relational, learned semantics as navigable geometry. It is the semantic model that makes modern AI's flexibility possible.`,
  },
  {
    slug: "how-model-binds-data",
    title: "How a Model Binds Data",
    weekNumber: 4,
    blurb: "Explanatory yield: compressing regularities inside the system.",
    lectureTitle: "4.4 How a Model Binds Data: Explanatory Yield Inside the System",
    body: `# How a Model Binds Data: Explanatory Yield Inside the System

A good model does more than fit examples — it **binds** the data together, capturing the regularities that make many observations hang as one. This binding is the AI analog of explanatory power.

## Binding as compression

To **bind** data is to capture the underlying regularity that connects many separate observations, so the model can reproduce and extend them from a compact internal representation rather than storing each one. This is essentially **compression**: a model that has truly bound its data has found the pattern, not the list. A lookup table that memorizes every training example binds nothing — it has zero explanatory yield and fails on anything new. A model that captures the generating regularity has high **explanatory yield**: it accounts for the data it saw *and* generalizes to data it did not, because the same bound regularity covers both.

## Explanatory yield inside the system

Classically, explanation is external — a theory explains phenomena out in the world. For an AI model the relevant explanatory relationship is **internal**: how well the learned representation binds the training distribution and projects onto new inputs. Explanatory yield is measured by **generalization**: a model that performs well on held-out data has bound real structure; one that performs well only on training data has merely memorized, binding nothing. This reframes Unit 1's generalization-versus-memorization tension as the question "did the model actually *bind* its data, or just store it?"

## A worked example

Train a model on planetary positions. One model memorizes every recorded position — perfect on the past, useless for tomorrow night; it bound nothing. Another learns the elliptical-orbit regularity — it compresses centuries of observations into a compact representation *and* predicts positions never recorded. The second model has high explanatory yield: it bound the data by finding the law beneath it. Every well-trained AI model aspires to be the second kind — to bind its data by capturing the regularity, not by hoarding the examples. Binding, not fitting, is the mark of a model that understands its domain.`,
  },
  {
    slug: "model-selection-parsimony",
    title: "Model Selection and Parsimony",
    weekNumber: 4,
    blurb: "Occam's razor reconceived under AI conditions.",
    lectureTitle: "4.5 Model Selection and Parsimony Under AI Conditions",
    body: `# Model Selection and Parsimony Under AI Conditions

Given many models that fit the data, which should you choose? Classical science answers "the simplest." AI complicates — and partly rescues — that ancient principle of **parsimony**.

## The classical razor

**Occam's razor** says: among competing explanations that fit the evidence equally well, prefer the *simplest*. Simplicity has long been treated as a mark of truth and a guard against overcomplication. In modeling, this corresponds to the **bias–variance trade-off**: an over-simple model *underfits* (too biased to capture the pattern), while an over-complex one *overfits* (too sensitive, memorizing noise). The classical instinct is that the sweet spot lies toward simplicity, and that adding parameters is a danger to be resisted.

## Parsimony reconceived

AI conditions strain the razor. Modern networks have *billions* of parameters — wildly "complex" by any classical count — yet often **generalize better** than smaller ones, sometimes improving past the point where classical theory predicts disaster. So parsimony is reconceived: what matters is not raw parameter count but **effective simplicity** — the smoothness and compressibility of the function the model actually represents, enforced by techniques like **regularization** that penalize needless complexity from within. A huge model trained to prefer simple explanations can be *effectively* parsimonious. The razor survives, but it now cuts on the simplicity of the learned function, not on the size of the model.

## A worked example

Fit ten noisy data points. A 9th-degree polynomial threads every point exactly — maximal complexity, classic overfit, wild between the points. A straight line may underfit. The right choice is a low-degree curve that captures the trend and ignores the noise: the parsimonious model that generalizes. Now the AI twist: a massive neural network, *regularized* to favor smooth functions, can behave like that gentle curve despite having millions of parameters — effectively simple even though nominally enormous. Choosing models well under AI conditions means measuring parsimony by the function learned, not by the parameters owned.`,
  },
  {
    slug: "testing-revising-model",
    title: "Testing and Revising a Model",
    weekNumber: 4,
    blurb: "Validation and revision from within the system.",
    lectureTitle: "4.6 Testing and Revising a Model From Within",
    body: `# Testing and Revising a Model From Within

A classical model is checked once against fixed sentences and is done. An AI model is **tested and revised continually**, and the discipline of doing so honestly is the subject here.

## Testing from within

Because an AI model is judged behaviorally, you cannot validate it by inspecting an interpretation — you must *test what it does*. The core discipline is the **held-out test set**: data the model never trained on, used to estimate how it will perform in the wild. Performance on training data is nearly meaningless (a memorizer scores perfectly and generalizes terribly); only performance on unseen data reveals whether the model *bound* real structure. Further splits — a **validation set** for tuning, a final test set for honest assessment — keep you from fooling yourself by tuning to the very data you use to judge.

## Revising from within

Testing feeds **revision**. When a model fails on held-out data or drifts as the world changes, you revise it — more data, different architecture, retraining, regularization — and test again. This loop *is* the meta-logic of learning from Unit 3 made operational: the model's rules update in response to evidence about its own performance. Revision is internal and perpetual; a deployed model is never finished, only current. The danger to guard against is **leakage** — letting test information seep into training — which produces flattering scores and real-world failure.

## A worked example

A team builds a model that scores 99% on its training images and ships it; in production it collapses to 60%. It memorized rather than bound — and they never tested from within on held-out data, so they never saw it coming. A disciplined team instead holds back a test set, sees the 99%/75% gap *before* shipping, diagnoses overfitting, adds regularization and data, and revises until training and test scores converge. Testing and revising from within is what separates a model that *looks* good on the data it has seen from one that *is* good on the data it has not.`,
  },
  {
    slug: "hybrid-frontier",
    title: "The Hybrid Frontier",
    weekNumber: 4,
    blurb: "Combining classical and ampliative models.",
    lectureTitle: "4.7 The Hybrid Frontier: Combining Classical and Ampliative Models",
    body: `# The Hybrid Frontier: Combining Classical and Ampliative Models

The course has drawn a sharp contrast between classical, transformative logic and AI's ampliative logic. The frontier of the field is not choosing between them but **combining** them.

## Why combine

Each kind of model has complementary strengths and weaknesses. Classical, rule-based systems are **transformative**: reliable, transparent, perfectly truth-preserving — but brittle, unable to learn, and helpless outside their rulebook. Ampliative, learned systems are **flexible**: they handle novelty, ambiguity, and perception, and they learn — but they are fallible, opaque, and prone to hallucinate. The natural move is to wire them together so the rules supply guarantees where guarantees are possible and the learned model supplies adaptability where rules cannot reach. This is the **neuro-symbolic** or hybrid program.

## How hybrids work

A hybrid system applies **rules where logic is knowable and stable**, and **pattern recognition where the world is messy** — with context deciding which does which. The learned model can propose; a rule layer can check, constrain, or veto. Or rules can structure a problem while learned components fill in the perceptual and linguistic gaps. The hard parts are exactly the integration challenges: combining symbolic and neural components technically, defining validation criteria for the whole, managing the emergence that comes from the learned side, and keeping uncertainty under control. But the payoff is a system that is both reliable *and* adaptive.

## A worked example

A modern math assistant pairs a language model with a symbolic checker. The learned model reads the problem and *proposes* steps — ampliative, creative, occasionally wrong. A classical proof verifier then *checks* each step with perfect, transformative rigor and rejects any that does not follow. Neither alone suffices: the verifier cannot invent a proof, and the language model cannot guarantee one. Together they invent *and* guarantee. That division of labor — learned proposal under classical verification — is the shape of the hybrid frontier, and likely the shape of the most trustworthy AI to come.`,
  },
  {
    slug: "synthesis-ampliative-system",
    title: "Synthesis: A Complete Ampliative System",
    weekNumber: 4,
    blurb: "Tying the four units into one picture of AI logic.",
    lectureTitle: "4.8 Synthesis: AI Logic as a Complete Ampliative System",
    body: `# Synthesis: AI Logic as a Complete Ampliative System

We end by assembling the whole course into a single picture. AI logic is not classical logic with noise added; it is a **complete ampliative system**, coherent on its own terms.

## The four pillars

The units fit together as one argument. **Fundamental concepts (Unit 1):** inference becomes pattern activation, entailment becomes learned association, confirmation becomes confidence, and the system is ampliative by nature — adding content rather than reshuffling it — which is exactly what lets it learn and lets it err. **Notation (Unit 2):** because the relationships are fuzzy, defeasible, and learned, they demand their own symbols (⇒, ≈, C(P), ▷), and an honest acknowledgment of what no notation can capture. **Meta-logic (Unit 3):** soundness gives way to reliability and calibration, defeasibility becomes the governing principle, consistency is maintained dynamically under revision, and the inference rules themselves update with experience. **Models (Unit 4):** a model is no longer an interpretation that satisfies sentences but the learned network itself, binding data through explanatory yield, chosen for effective parsimony, and tested and revised from within.

## Why "complete ampliative system"

These pieces are not patches on classical logic; they cohere. The single thread running through all four units is **ampliativity** — inference that adds content. Once you accept that a logic can legitimately reach beyond its premises, everything else follows: graded confidence instead of binary truth, defeasible conclusions instead of permanent ones, reliability instead of soundness, learned models instead of stipulated interpretations, and rules that grow with experience. AI logic is what you get when you take ampliative inference seriously and build an entire logic around it, rather than treating it as deduction's poor relation.

## The closing example, and the closing thought

Recall Unit 1's Larry: from missing valuables you inferred a thief — an ampliative, defeasible, fallible leap that nonetheless yields real knowledge. Every theme of this course lives in that ordinary inference: it activates a pattern, it could be defeated by new facts, its confidence is graded, and it adds content the premises did not contain. AI systems reason the way that inference reasons, at enormous scale. They do not threaten the idea of knowledge; as Unit 1 argued, they **vindicate** the anti-skeptical claim that reliable, fallible, ampliative inference is exactly what knowledge has always been. AI logic, complete on its own terms, is the formal study of that kind of reasoning — and, increasingly, the logic by which our most powerful systems think.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const HW_INSTRUCTIONS =
  "Short-answer conceptual problems. Answer in your own words — concise, precise statements score best. Pasting is allowed for homework, but typing your own reasoning is strongly encouraged.";
const TIMED_INSTRUCTIONS = (mins: number) =>
  `Timed: ${mins} minutes. Conceptual short-answer questions; pasting is disabled. Write clear, precise answers in your own words.`;

const ASSIGNMENTS: SeedAssignment[] = [
  // ───────────── Unit 1 ─────────────
  {
    kind: "homework",
    title: "Homework 1.1 — Inference, its types, and pattern activation",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "concept-of-inference",
        prompt:
          "Define inference in one sentence, and state the key difference between how traditional logic and an AI system carry it out.",
        correctAnswer:
          "Inference is forming a new belief on the basis of an old one. Traditional logic steps from one discrete belief to another by explicit reasoning; an AI system makes inferences by activating patterns across learned weighted connections, in parallel and probabilistically, with no discrete beliefs.",
        explanation:
          "The classical picture has discrete beliefs and direct vs. indirect knowledge. AI dissolves that: all knowledge is weighted connections, and inference is statistical pattern activation rather than stepwise reasoning.",
      },
      {
        topicSlug: "types-of-inference",
        prompt:
          "Name the three classical types of inference and say, in a phrase each, how tightly each binds its conclusion.",
        correctAnswer:
          "Deductive: premises make the conclusion certain. Inductive: premises make the conclusion probable but not guaranteed. Abductive: inference to the best explanation of what is observed.",
        explanation:
          "AI blurs all three into continuous pattern matching whose confidence varies smoothly, rather than picking one type and applying it.",
      },
      {
        topicSlug: "entailment-vs-pattern-activation",
        prompt:
          "What is entailment in classical logic, and what does an AI system use in its place?",
        correctAnswer:
          "Entailment: A entails B when B cannot be false if A is true — a strict, binary, necessary, context-independent relationship. An AI system replaces it with pattern activation: one pattern activates another by learned association, with continuous, context-dependent strength and no guarantee of necessity.",
        explanation:
          "'Doctor' activating 'hospital' is strong association, not entailment. The model has no separate machinery for necessity; even genuine entailments are just strong learned associations.",
      },
      {
        topicSlug: "over-valuation-entailment",
        prompt:
          "Explain why model-theoretic entailment is said to be 'over-valued,' using the 1+1=2 example, and what AI uses instead.",
        correctAnswer:
          "Because any necessary truth model-theoretically entails any other (there is no scenario where a necessary truth is false), '1+1=2' entails 'triangles have three sides' even though they are conceptually unrelated — the criterion certifies useless, irrelevant connections. AI uses learned proximity in an embedding space, which represents only relevant, recurring relationships.",
        explanation:
          "The relationship classical logic prizes most does not track inferential relevance. AI's learned, relevance-tracking notion is more useful for actual reasoning.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Confidence, ampliativity, knowledge, and skepticism",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "confirmation-vs-confidence",
        prompt:
          "Give one important way an AI confidence score differs from classical confirmation, and why this matters in practice.",
        correctAnswer:
          "Classical confirmation is evidential support that obeys probability rules; an AI confidence score reflects pattern strength, is not necessarily normalized, is context-dependent, and need not follow probability rules. It matters because a model can be miscalibrated — highly confident and wrong — so the number must be verified, not trusted as a probability.",
        explanation:
          "The wolf/snow classifier scored 0.98 while keying on the background. Calibration (making the score match the chance of being correct) is a separate hard problem precisely because confidence ≠ confirmation.",
      },
      {
        topicSlug: "ampliative-thesis",
        prompt:
          "Define ampliative vs. non-ampliative (transformative) inference, and say which kind AI systems are by nature.",
        correctAnswer:
          "An ampliative inference adds content not already in the premises; a non-ampliative (transformative) one only makes explicit what the premises already contained. AI systems are inherently ampliative — they combine patterns to generate novel outputs.",
        explanation:
          "Deduction is non-ampliative; induction and abduction are ampliative. Generating 'an astronaut riding a horse on Mars' shows ampliative inference, and the same faculty that lets a model create also lets it hallucinate.",
      },
      {
        topicSlug: "knowledge-in-ai",
        prompt:
          "State the classical analysis of knowledge and explain the worry about whether an AI 'knows' what it outputs.",
        correctAnswer:
          "Classically, knowledge is justified true belief. The worry (the 'stochastic parrot' concern) is that an AI has no discrete justified beliefs — its knowledge is distributed in weights — so it can output a true statement by modeling statistics without believing it or having a reason, i.e. merely outputting rather than knowing.",
        explanation:
          "A correct output is not proof of knowledge; a model can be right for no reliable reason (an AI echo of Gettier cases). Hence: verify rather than assume understanding.",
      },
      {
        topicSlug: "anti-skeptical-epistemology",
        prompt:
          "Explain why a reliably-working AI system supports the anti-skeptical (fallibilist) view of knowledge rather than the skeptic's.",
        correctAnswer:
          "The skeptic demands certainty for knowledge; the anti-skeptic/fallibilist says knowledge needs only reliable processes that usually get it right. A working AI has no certain foundations yet reliably succeeds, showing that knowledge-like performance is possible without certainty — exactly the fallibilist claim. Its errors are the expected price of any reliable-but-fallible ampliative process.",
        explanation:
          "A self-driving car identifies pedestrians reliably without certainty. Reliability, not certainty, is what knowledge and competent action run on.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit 1 Test — Fundamental Concepts",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions: TIMED_INSTRUCTIONS(30),
    problems: [
      {
        topicSlug: "concept-of-inference",
        prompt:
          "In an AI system, why is there no clean distinction between 'direct' and 'indirect' knowledge?",
        correctAnswer:
          "Because all of the system's knowledge exists as weighted connections rather than as discrete beliefs reached by reasoning, there is nothing that is non-inferentially 'given' versus inferentially derived — every output is pattern activation over the same weights.",
        explanation:
          "The classical direct/indirect split assumes discrete beliefs; AI has only distributed weights, so the split has nothing to attach to.",
      },
      {
        topicSlug: "types-of-inference",
        prompt:
          "A language model answers a syllogism correctly with deductive-looking steps. Has it performed deduction? Explain.",
        correctAnswer:
          "No — not in the classical sense. It recognized the syllogism pattern from training and generated the most plausible continuation by statistical pattern matching; the output resembles deduction but the underlying mechanism is the same continuous pattern completion it uses for any inference.",
        explanation:
          "Chain-of-thought can look deductive while remaining fundamentally statistical; multiple valid paths can exist.",
      },
      {
        topicSlug: "entailment-vs-pattern-activation",
        prompt:
          "Give an example of strong pattern activation that is NOT entailment, and explain the difference.",
        correctAnswer:
          "'Doctor' strongly activates 'hospital,' but 'is a doctor' does not entail 'is in a hospital' — a doctor can be anywhere. Activation is learned, graded, context-dependent association from co-occurrence; entailment is a strict relationship where the conclusion cannot be false if the premise is true.",
        explanation:
          "The model holds genuine entailments and mere associations with the same machinery, so it has no built-in guarantee of necessity.",
      },
      {
        topicSlug: "confirmation-vs-confidence",
        prompt:
          "What does it mean for a model to be 'miscalibrated,' and why is calibration its own problem?",
        correctAnswer:
          "Miscalibrated means the confidence score does not match the actual probability of being correct — e.g. the model is very confident yet often wrong. Calibration is a separate problem because confidence reflects pattern strength, not genuine evidential support or truth, so a high number does not by itself indicate a high chance of correctness.",
        explanation:
          "Treat a confidence score as pattern strength to be verified, not as a trustworthy probability.",
      },
      {
        topicSlug: "ampliative-thesis",
        prompt:
          "Explain why the same capability that makes AI creative also makes it hallucinate.",
        correctAnswer:
          "Both stem from ampliative inference — reaching beyond the premises to add content. Reaching beyond the evidence is what lets a model generate genuinely novel outputs, and the same reaching beyond the evidence is what lets it produce confident falsehoods. Creativity and hallucination are two faces of one ampliative capability.",
        explanation:
          "A transformative (non-ampliative) system cannot hallucinate, but it also cannot create or learn; ampliativity buys both powers and both risks.",
      },
    ],
  },

  // ───────────── Unit 2 ─────────────
  {
    kind: "homework",
    title: "Homework 2.1 — New notation, defeasibility, non-monotonicity, embeddings",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "why-new-notation",
        prompt:
          "Give two assumptions built into classical notation (like P→Q) that AI reasoning violates, and name one AI-logic symbol introduced to replace it.",
        correctAnswer:
          "Classical → assumes relationships are binary and context-independent (and defined, not learned); AI relationships are fuzzy/graded and context-sensitive (and learned). A replacement symbol is P⇒Q for pattern activation (others: ≈ for similarity, C(P) for confidence, ▷ for a reasoning step).",
        explanation:
          "Distinct symbols keep you from mistaking a learned, graded, revisable association for a strict logical law.",
      },
      {
        topicSlug: "defeasible-inference",
        prompt:
          "What is a defeasible inference, and why is it written with ⇒ rather than the strict →?",
        correctAnswer:
          "A defeasible inference is one you are entitled to draw now but may have to withdraw when more is learned (e.g. 'bird ⇒ flies,' defeated by 'penguin'). It is written ⇒, not →, to signal that the conclusion is provisional and subject to defeat, not a permanent strict implication.",
        explanation:
          "The conditions that would withdraw it are its defeaters. Most everyday and AI reasoning is defeasible.",
      },
      {
        topicSlug: "non-monotonic-reasoning",
        prompt:
          "Define monotonic vs. non-monotonic reasoning and give the signature behavior of the non-monotonic case.",
        correctAnswer:
          "Monotonic: adding premises can only add conclusions, never remove them. Non-monotonic: adding a premise can remove a previously held conclusion. Signature behavior: from {bird} conclude 'flies'; adding the true premise 'penguin' makes you drop 'flies' — the conclusion set shrank as the premise set grew.",
        explanation:
          "Classical logic is monotonic; real and AI reasoning is non-monotonic, which the classical arrow cannot express.",
      },
      {
        topicSlug: "semantic-network-notation",
        prompt:
          "What does P≈Q mean, how is it measured, and why might P≈Q and Q≈R fail to give P≈R?",
        correctAnswer:
          "P≈Q means patterns P and Q are similar in the embedding space, measured by a metric such as cosine distance. Similarity is continuous and context-dependent and need not be transitive, so closeness can drift across a high-dimensional space — P near Q and Q near R does not guarantee P near R.",
        explanation:
          "Embeddings turn meaning into geometry; king − man + woman ≈ queen is this notation (and vector arithmetic) in action.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — Confidence marks, syntax/semantics, step types, limits",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "marking-confidence",
        prompt:
          "Why does confidence typically decay along a reasoning chain, and why is combining patterns not simple multiplication?",
        correctAnswer:
          "Along a chain (P▷Q, Q▷R) uncertainty compounds, so support for the later conclusion is usually weaker than for any single step. Combining patterns is not multiplication — C(P⊕Q) ≠ C(P)×C(Q) — because patterns can reinforce or interfere with each other rather than behaving like independent probabilities.",
        explanation:
          "Annotating strength (e.g. P⇒[0.8]Q) makes visible where a chain is shaky and where human review is needed.",
      },
      {
        topicSlug: "syntax-semantics-collapse",
        prompt:
          "Explain the 'syntax/semantics collapse' and why it breaks a core assumption of classical logic.",
        correctAnswer:
          "Classical logic strictly separates syntax (form) from semantics (meaning), handling them with different machinery. In an embedding space, expressions and meanings live in the same space and are learned jointly, so form and meaning are computed together and the question 'is this syntactic or semantic?' often has no answer — the divide collapses.",
        explanation:
          "Resolving 'it' in the trophy/suitcase sentence uses one computation that tracks structure and meaning at once, not syntax-then-semantics.",
      },
      {
        topicSlug: "transformative-vs-ampliative-notation",
        prompt:
          "How does the notation distinguish a transformative step from an ampliative step, and why does the distinction matter for auditing reasoning?",
        correctAnswer:
          "A transformative step (P⊢Q) only makes explicit what was already in P and preserves truth; an ampliative step (P▷Q) adds new content and can introduce error. The distinction matters because it locates exactly where reasoning added something — the ▷ steps — which are the only places a conclusion could be wrong, so auditing reduces to checking the ampliative steps.",
        explanation:
          "Truth flows safely across ⊢ links; across ▷ links it is only probable and confidence decays.",
      },
      {
        topicSlug: "limits-of-formalization",
        prompt:
          "Name two features of AI systems that make any notation 'necessarily approximate.'",
        correctAnswer:
          "Any two of: pervasive context-dependence (every operator's meaning shifts with surroundings), emergence (novel capabilities arise from combination and cannot be anticipated from the parts), and inconsistency (the same input can yield different results). These resist the discrete, fixed-rule assumptions notation was built on.",
        explanation:
          "Notation gives real clarity (strict vs. defeasible, transformative vs. ampliative) but cannot capture emergent properties like why a punchline is funny.",
      },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Units 1 & 2",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 50,
    instructions:
      "Cumulative midterm on fundamental concepts (Unit 1) and notational conventions (Unit 2). " +
      TIMED_INSTRUCTIONS(50),
    problems: [
      {
        topicSlug: "concept-of-inference",
        prompt:
          "Contrast how traditional logic and an AI system each 'form a new belief on the basis of an old one.'",
        correctAnswer:
          "Traditional logic forms a discrete new belief by an explicit reasoning step from a prior belief, distinguishing direct from indirect knowledge. An AI system instead activates patterns across learned weighted connections in parallel and probabilistically, with no discrete beliefs and no direct/indirect distinction.",
        explanation:
          "Same function — inference — radically different mechanism: stepwise reasoning vs. distributed pattern activation.",
      },
      {
        topicSlug: "entailment-vs-pattern-activation",
        prompt:
          "Why does an AI system have no special machinery for logical necessity?",
        correctAnswer:
          "Because it represents all relationships uniformly as learned associations of graded strength. A genuine entailment is stored the same way as a mere strong correlation, so the system cannot mark some links as necessary — it only has stronger and weaker, context-dependent activations.",
        explanation:
          "This is the trade: rich flexible association is gained, the guarantee that true premises can't yield false conclusions is lost.",
      },
      {
        topicSlug: "confirmation-vs-confidence",
        prompt:
          "A model outputs '0.9.' Why is it a mistake to treat this as 'a 90% probability of being correct'?",
        correctAnswer:
          "The score reflects pattern strength, not a true probability: it is not necessarily normalized, is context-dependent, need not obey probability rules, and the model may be miscalibrated (confident and wrong). So 0.9 indicates how strongly a learned pattern fired, not a verified 90% chance of correctness.",
        explanation:
          "Calibration is required to make scores match real accuracy; until then, verify the output.",
      },
      {
        topicSlug: "ampliative-thesis",
        prompt:
          "Why is deduction called non-ampliative, and why does that make it safe but limited?",
        correctAnswer:
          "Deduction only makes explicit what the premises already contain, adding no new content, so it is non-ampliative. That makes it perfectly truth-preserving (safe) but unable to acquire genuinely new information from the world (limited) — it can only reshuffle what it is given.",
        explanation:
          "Learning requires adding content, so a purely deductive system cannot learn.",
      },
      {
        topicSlug: "why-new-notation",
        prompt:
          "Why is writing 'doctor → hospital' with the classical arrow misleading?",
        correctAnswer:
          "The classical arrow asserts a strict, universal, context-independent implication, but 'doctor' merely activates 'hospital' as a strong, learned, defeasible, context-dependent association — a doctor need not be in a hospital. The arrow cannot express that the link is graded and revisable, so it overstates the relationship.",
        explanation:
          "AI logic uses ⇒ precisely to mark such associations as non-strict.",
      },
      {
        topicSlug: "non-monotonic-reasoning",
        prompt:
          "Explain the paradox, from a classical standpoint, of a non-monotonic system being given 'more truth.'",
        correctAnswer:
          "Classically, adding true premises should never cost you a conclusion (monotonicity). In a non-monotonic system, adding the true premise 'Tweety is a penguin' to 'Tweety is a bird' removes the conclusion 'Tweety flies' — so supplying strictly more correct information subtracted a conclusion, which looks paradoxical classically but is normal and necessary for real reasoning.",
        explanation:
          "Honest AI notation must make this shrink-on-addition behavior natural, not anomalous.",
      },
      {
        topicSlug: "semantic-network-notation",
        prompt:
          "Explain how 'king − man + woman ≈ queen' captures something classical notation cannot.",
        correctAnswer:
          "It shows that meaning is encoded as geometry: relationships are directions in an embedding space, so the 'gender' shift is a vector that moves king to the neighborhood of queen. Classical notation has no way to express graded, relational, spatial meaning or vector arithmetic over concepts — only binary implication.",
        explanation:
          "≈ and embedding geometry capture the actual currency of modern AI: learned relational similarity.",
      },
      {
        topicSlug: "transformative-vs-ampliative-notation",
        prompt:
          "A model solves a word problem and gets it wrong. Why does marking ⊢ vs ▷ steps help find the error?",
        correctAnswer:
          "Truth is preserved across transformative (⊢) steps, so errors can only enter at ampliative (▷) steps that added content — for example an unstated assumption read from the prose. Marking the steps points the auditor straight at the ▷ steps to check, rather than re-verifying truth-preserving algebra.",
        explanation:
          "Auditing AI reasoning is largely the work of locating and checking the ampliative leaps.",
      },
    ],
  },

  // ───────────── Unit 3 ─────────────
  {
    kind: "homework",
    title: "Homework 3.1 — Meta-logic, reconceived soundness, defeasibility, revision",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "what-is-metalogical-principle",
        prompt:
          "What is a meta-logical principle (vs. an object-level rule), and why can't AI logic just borrow classical meta-logic?",
        correctAnswer:
          "An object-level rule (like modus ponens) operates inside a logic; a meta-logical principle is a statement about the logic itself (soundness, completeness, consistency). AI logic cannot borrow classical meta-logic because that presupposes discreteness, monotonicity, fixed rules, and binary truth — exactly what AI abandons — so it needs reconceived principles for an ampliative, defeasible, learned system.",
        explanation:
          "Asking whether a neural network is 'complete' in the classical sense is a category error.",
      },
      {
        topicSlug: "soundness-completeness-reconceived",
        prompt:
          "What replaces classical soundness and completeness for an ampliative system, and why can't the originals apply?",
        correctAnswer:
          "Soundness (never derive a falsehood) is impossible because an ampliative system reaches beyond its premises and can be wrong; it is replaced by reliability and calibration. Completeness (derive every truth) does not apply since there is no fixed truth set to exhaust; it is replaced by coverage/generalization — performing well across the full range of real inputs.",
        explanation:
          "For a spam filter these become a false-positive rate (soundness analog) and recall (completeness analog), plus calibration.",
      },
      {
        topicSlug: "defeasibility-governing-principle",
        prompt:
          "Explain the reversal of status that defeasibility undergoes between classical and AI logic.",
        correctAnswer:
          "In classical logic, strict permanent implication is the norm and defeasible (withdrawable) inference is a treated as an anomaly needing special patches. In AI logic the reversal is complete: defeasibility is the governing norm and indefeasible implication is the rare special case, because a system learning in an open world must constantly revise.",
        explanation:
          "A good system is judged on whether it withdraws the right conclusions at the right time, not on never withdrawing any.",
      },
      {
        topicSlug: "consistency-under-revision",
        prompt:
          "Why must consistency be dynamic in a learning system, and why don't AI systems 'explode' from a single contradiction?",
        correctAnswer:
          "Beliefs change constantly, so consistency cannot be a one-time static check — it must be maintained as a property of the revision process (revise gracefully, give up the least you must, don't collapse). AI systems don't explode because, unlike classical logic with its principle of explosion, they tolerate competing patterns and let context arbitrate, so a local contradiction stays contained.",
        explanation:
          "A recommender can hold 'likes action' and 'likes documentaries' at once, weighting by recency, instead of overwriting one.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — Pattern primitive, arbitration, transformativity, learning",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "pattern-recognition-primitive",
        prompt:
          "What is the inferential 'primitive' in classical logic vs. AI logic, and what does treating pattern recognition as a primitive claim?",
        correctAnswer:
          "Classical logic's primitive is applying an inference rule to symbols (syntactic rule application). AI logic's primitive is pattern recognition — matching input to learned regularities and activating what is similar. Treating it as a genuine inferential primitive claims that similarity-driven activation is itself a way of reasoning, not a mere preprocessing step before 'real' logic.",
        explanation:
          "A radiology model recognizing a tumor pattern IS the inference, the atom the diagnosis is built from.",
      },
      {
        topicSlug: "screening-defeat-override",
        prompt:
          "Distinguish a rebutting defeater, an undercutting defeater, and screening off.",
        correctAnswer:
          "A rebutting defeater gives positive reason for the opposite conclusion; an undercutting defeater removes the support for the original conclusion without arguing the contrary; screening off makes one factor irrelevant once a screening factor is known, so it no longer changes the conclusion.",
        explanation:
          "A news post quoting a slur to condemn it undercuts 'remove' and screens off the raw keyword match.",
      },
      {
        topicSlug: "classical-logic-transformative",
        prompt:
          "State the thesis that classical logic is 'merely transformative' and give one consequence.",
        correctAnswer:
          "Classical deduction never adds content — it only makes explicit what the premises already contain (it reshuffles rather than generates), which is why it is perfectly truth-preserving. A consequence: classical logic alone cannot learn, since learning is acquiring genuinely new content and a purely transformative system never adds any.",
        explanation:
          "Hence ampliative inference is indispensable, not a poor relation of deduction.",
      },
      {
        topicSlug: "metalogic-of-learning",
        prompt:
          "Why is 'inference rules that themselves update' a meta-logical fact, and where do those rules live in an AI system?",
        correctAnswer:
          "It is meta-logical because it is a property of the system as a whole, not a conclusion drawn within it. In an AI system the effective inference rules are encoded in the weights, and training changes the weights — so the rules by which the system reasons are themselves learned and revised from experience.",
        explanation:
          "A retrained spam filter literally revises its inference rules (e.g. 'crypto' going from weak to strong evidence) with no human editing a rule.",
      },
    ],
  },
  {
    kind: "test",
    title: "Unit 3 Test — Meta-Logical Principles",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions: TIMED_INSTRUCTIONS(30),
    problems: [
      {
        topicSlug: "what-is-metalogical-principle",
        prompt:
          "Classify each as object-level or meta-level: (a) 'the model labeled this image cat'; (b) 'the model's confidence scores are well-calibrated across all classes.'",
        correctAnswer:
          "(a) is object-level — a single output of the system. (b) is meta-level — a claim about a property of the system as a whole (calibration across classes), not about any one output.",
        explanation:
          "Trust, evaluation, and safety live at the meta level — claims about the system, not its individual outputs.",
      },
      {
        topicSlug: "soundness-completeness-reconceived",
        prompt:
          "Why does judging a useful spam filter by classical soundness and completeness declare it a failure?",
        correctAnswer:
          "Classically sound means never producing a false result and complete means catching every truth. A real filter will sometimes flag a legitimate email (not sound) and cannot catch every newly invented spam (not complete), so those absolute standards label every useful filter a failure. The right standards are statistical: false-positive rate, recall, and calibration.",
        explanation:
          "Ampliative systems trade absolute guarantees for measurable reliability.",
      },
      {
        topicSlug: "defeasibility-governing-principle",
        prompt:
          "A navigation app reroutes when a road closes. Why is this success, not a logical breakdown?",
        correctAnswer:
          "Its routes are defeasible defaults, and defeasibility is the governing principle: it is designed to revise conclusions when conditions change. Retracting the old route and producing a new one is the system working as intended, not a failure of its logic.",
        explanation:
          "Operating in a changing world requires treating conclusions as revisable defaults.",
      },
      {
        topicSlug: "pattern-recognition-primitive",
        prompt:
          "Why does treating pattern recognition as a genuine inferential primitive narrow the gap between 'mere statistics' and 'real reasoning'?",
        correctAnswer:
          "Because if recognizing a pattern and activating its associations is itself the atomic act of inference, then statistical pattern matching is not a substitute for reasoning but the most basic form of it. Chains of thought, classifications, and analogies are elaborations of that primitive, so 'mere statistics' just is reasoning at the base level.",
        explanation:
          "The primitive of a logic defines what kind of system it is; AI's primitive is recognition, not rule application.",
      },
      {
        topicSlug: "metalogic-of-learning",
        prompt:
          "What is the difference between a system that reaches new conclusions and one whose inference rules update — and which is an AI system?",
        correctAnswer:
          "Reaching new conclusions happens within fixed rules (classical logic does this); having inference rules update means the rules themselves change with experience. An AI system does the latter: training rewrites the weights that encode its inference rules, so its logic is perpetually under construction by its own experience.",
        explanation:
          "This is the meta-logic of learning and the final reason AI logic is a different kind of logic.",
      },
    ],
  },

  // ───────────── Unit 4 ─────────────
  {
    kind: "homework",
    title: "Homework 4.1 — Models, networks, embeddings, binding data",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "what-is-a-model",
        prompt:
          "Define 'model' in classical logic and in AI logic, and state the core difference.",
        correctAnswer:
          "Classically, a model is an interpretation — an assignment of values that makes open sentences true (e.g. x=2 satisfies 'x is even and x²<20'). In AI, the model is the neural network itself, a learned function whose weights are its interpretation. Core difference: a classical model is an external interpretation you check sentences against; an AI model is a dynamic learned system you run inputs through.",
        explanation:
          "Truth values give way to continuous activations; stipulated satisfaction gives way to learned, context-modified behavior.",
      },
      {
        topicSlug: "neural-networks-as-models",
        prompt:
          "In the network-as-model view, what plays the role of the 'interpretation,' and how does validation change?",
        correctAnswer:
          "The weights and biases play the role of the interpretation — they encode the input-to-output mapping that is the network's understanding. Validation changes from checking whether a fixed interpretation satisfies a sentence to evaluating, statistically and behaviorally, how well the network's outputs match reality across many inputs.",
        explanation:
          "The parameters ARE the interpretation; retraining changes the interpretation, so the same input can be read differently.",
      },
      {
        topicSlug: "embedding-spaces-as-models",
        prompt:
          "Explain 'meaning as geometry' and one property of embedding-space semantics that classical model theory lacks.",
        correctAnswer:
          "In an embedding space, every concept is a learned vector and meaning is position: similar concepts are close, unrelated ones far, and relationships are directions. A property classical model theory lacks is continuity (intermediate meanings exist between any two points) — also context-sensitivity and relational meaning, where a concept's meaning is its location relative to everything else.",
        explanation:
          "A search for 'the city of light' returns Paris by landing in its neighborhood, with no shared keywords.",
      },
      {
        topicSlug: "how-model-binds-data",
        prompt:
          "What does it mean for a model to 'bind' its data, and how is explanatory yield measured?",
        correctAnswer:
          "Binding data means capturing the underlying regularity that connects many observations, so the model reproduces and extends them from a compact representation (essentially compression) rather than storing each example. Explanatory yield is measured by generalization: strong performance on held-out data shows real structure was bound; good performance only on training data shows mere memorization, which binds nothing.",
        explanation:
          "A model learning the elliptical-orbit law binds the data; one memorizing positions does not.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Parsimony, testing/revising, hybrids, synthesis",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: HW_INSTRUCTIONS,
    problems: [
      {
        topicSlug: "model-selection-parsimony",
        prompt:
          "How is Occam's razor reconceived under AI conditions, given that huge models often generalize well?",
        correctAnswer:
          "Classically the razor prefers fewer parameters, but billion-parameter networks often generalize better than small ones. So parsimony is reconceived as effective simplicity — the smoothness/compressibility of the function the model actually represents — enforced by regularization, rather than raw parameter count. A large model trained to prefer simple functions can be effectively parsimonious.",
        explanation:
          "Measure parsimony by the learned function, not by parameters owned; this also reframes the bias–variance trade-off.",
      },
      {
        topicSlug: "testing-revising-model",
        prompt:
          "Why is performance on training data nearly meaningless, and what is 'leakage'?",
        correctAnswer:
          "A memorizing model scores perfectly on training data while generalizing terribly, so training performance doesn't reveal real ability — only held-out test data does. Leakage is letting test information seep into training (e.g. tuning on the test set), which inflates scores and causes real-world failure.",
        explanation:
          "Use separate validation and test splits; a deployed model is never finished, only current.",
      },
      {
        topicSlug: "hybrid-frontier",
        prompt:
          "Why combine classical and ampliative models, and how does a hybrid typically divide the labor?",
        correctAnswer:
          "Their strengths are complementary: classical rules are reliable, transparent, and truth-preserving but brittle and unable to learn; ampliative models are flexible and learn but are fallible and opaque. A hybrid applies rules where logic is knowable and pattern recognition where the world is messy — e.g. the learned model proposes while a rule layer checks, constrains, or vetoes.",
        explanation:
          "A math assistant where an LLM proposes steps and a symbolic verifier checks them invents AND guarantees.",
      },
      {
        topicSlug: "synthesis-ampliative-system",
        prompt:
          "What single thread unifies all four units into 'a complete ampliative system'?",
        correctAnswer:
          "Ampliativity — inference that adds content. Once a logic legitimately reaches beyond its premises, everything follows: graded confidence instead of binary truth, defeasible conclusions instead of permanent ones, reliability instead of soundness, learned models instead of stipulated interpretations, and rules that update with experience. AI logic is what you get by building an entire logic around ampliative inference.",
        explanation:
          "The pieces cohere rather than patching classical logic; ampliative power and fallibility are inseparable.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — AI Logic",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 75,
    instructions:
      "Comprehensive final across all four units of AI Logic. " + TIMED_INSTRUCTIONS(75),
    problems: [
      {
        topicSlug: "concept-of-inference",
        prompt:
          "Define inference and contrast the classical stepwise mechanism with the AI pattern-activation mechanism.",
        correctAnswer:
          "Inference is forming a new belief on the basis of an old one. Classically it is an explicit step from one discrete belief to another (with direct vs. indirect knowledge); in AI it is parallel, probabilistic activation of patterns across learned weighted connections, with no discrete beliefs and no direct/indirect split.",
        explanation:
          "Same function, different mechanism — the founding contrast of the whole course.",
      },
      {
        topicSlug: "entailment-vs-pattern-activation",
        prompt:
          "Explain the trade-off a system accepts when it replaces entailment with pattern activation.",
        correctAnswer:
          "It gains rich, flexible, graded, context-sensitive association learned from data, and it loses the guarantee of necessity — that a true premise can never yield a false conclusion. All relationships, including genuine entailments, are stored as associations of varying strength, so there is no built-in certainty.",
        explanation:
          "Flexibility for guarantee is the core bargain of ampliative reasoning.",
      },
      {
        topicSlug: "ampliative-thesis",
        prompt:
          "Why are creativity and hallucination 'two faces of one capability'?",
        correctAnswer:
          "Both come from ampliative inference — reaching beyond the premises to add content. Reaching beyond the evidence is what produces novel, creative outputs, and the same reaching is what produces confident falsehoods. You cannot have the generative power without the risk of error.",
        explanation:
          "A transformative system can neither hallucinate nor create; ampliativity buys both.",
      },
      {
        topicSlug: "anti-skeptical-epistemology",
        prompt:
          "How does a reliably-working AI settle the dispute between the skeptic and the fallibilist?",
        correctAnswer:
          "The skeptic says knowledge requires certainty; the fallibilist says it requires only reliable, usually-correct processes. A working AI succeeds reliably with no certain foundations, proving knowledge-like performance is possible without certainty — the fallibilist position. Its errors are the expected cost of a reliable-but-fallible ampliative process, not evidence against knowledge.",
        explanation:
          "Reliability, not certainty, is what knowledge runs on; AI vindicates anti-skepticism.",
      },
      {
        topicSlug: "non-monotonic-reasoning",
        prompt:
          "Define non-monotonic reasoning and explain why classical (monotonic) notation cannot express it.",
        correctAnswer:
          "Non-monotonic reasoning is reasoning in which adding a premise can remove a previously held conclusion (e.g. adding 'penguin' removes 'flies'). Classical implication is monotonic — adding premises only ever adds conclusions — so its arrow has no way to represent a conclusion being withdrawn when information grows.",
        explanation:
          "Defeasibility at the system level; AI notation marks conclusions as defeasible (⇒) and dependent on absent defeaters.",
      },
      {
        topicSlug: "transformative-vs-ampliative-notation",
        prompt:
          "Why is locating the ampliative (▷) steps the key to auditing an AI's reasoning?",
        correctAnswer:
          "Transformative (⊢) steps preserve truth, so they cannot introduce error; only ampliative (▷) steps add content and can be wrong. Therefore any mistake must lie in a ▷ step, and auditing reduces to finding and checking those content-adding leaps rather than re-verifying truth-preserving steps.",
        explanation:
          "Confidence also decays across ▷ links, so they are where reasoning is both new and risky.",
      },
      {
        topicSlug: "soundness-completeness-reconceived",
        prompt:
          "Why can't an ampliative system be classically sound, and what is the honest replacement?",
        correctAnswer:
          "An ampliative system reaches beyond its premises, so it can derive falsehoods — strict soundness (never wrong) is impossible. The honest replacement is reliability and calibration: being wrong rarely, and being confident in proportion to how often it is actually right.",
        explanation:
          "Completeness similarly gives way to coverage/generalization; absolute guarantees become statistical ones.",
      },
      {
        topicSlug: "defeasibility-governing-principle",
        prompt:
          "Explain why, in AI logic, withdrawing a conclusion is a feature rather than a defect.",
        correctAnswer:
          "Because defeasibility is the governing principle: a system learning and acting in an open world must revise conclusions as new information arrives. Withdrawing the right conclusion at the right time is exactly what a good system is designed and evaluated to do, so retraction is correct operation, not failure.",
        explanation:
          "Classical logic treats withdrawal as anomaly; AI logic reverses the status, making it the norm.",
      },
      {
        topicSlug: "metalogic-of-learning",
        prompt:
          "What does it mean that an AI's inference rules 'themselves update,' and why is this the signature of learning?",
        correctAnswer:
          "It means the rules by which the system draws conclusions — encoded in its weights — are changed by training, not just the conclusions reached within fixed rules. This is the signature of learning because learning is the acquisition of new content, and a system that revises its own inference rules in light of experience is acquiring genuinely new ways of reasoning.",
        explanation:
          "Classical rules are permanent; self-updating rules are why AI logic is a different kind of logic.",
      },
      {
        topicSlug: "what-is-a-model",
        prompt:
          "Contrast a classical model with an AI model, and say what you 'do' with each.",
        correctAnswer:
          "A classical model is an interpretation — an assignment of values that makes sentences true — which you check sentences against; it is static, discrete, and context-independent. An AI model is the learned neural network itself, whose weights are its interpretation, which you run inputs through; it is dynamic, continuous, learned, and context-sensitive.",
        explanation:
          "Check-against vs. run-through captures the whole reconception of 'model.'",
      },
      {
        topicSlug: "how-model-binds-data",
        prompt:
          "Explain why a lookup table has zero explanatory yield while a model that generalizes has high yield.",
        correctAnswer:
          "A lookup table stores each example separately and fails on anything new — it captures no underlying regularity, so it binds nothing and has zero explanatory yield. A model that generalizes has captured the regularity that connects the observations (compression), accounting for both seen and unseen data, which is high explanatory yield.",
        explanation:
          "Binding (finding the law) vs. fitting (hoarding examples) is the mark of a model that understands its domain.",
      },
      {
        topicSlug: "hybrid-frontier",
        prompt:
          "Describe the division of labor in a hybrid (neuro-symbolic) system and why neither component suffices alone.",
        correctAnswer:
          "The learned model handles messy, novel, perceptual work and proposes content; the symbolic/rule component supplies reliable, transparent, truth-preserving checking, constraint, or veto. Neither suffices alone because the rule system is brittle and cannot learn or invent, while the learned model is fallible and cannot guarantee correctness — together they invent and guarantee.",
        explanation:
          "LLM-proposes-plus-verifier-checks is the shape of the hybrid frontier and likely of the most trustworthy AI.",
      },
    ],
  },
];

// A stable fingerprint of the seed content. If the database holds topics that
// don't match this set, we wipe and re-seed instead of leaving stale content
// from a previous version of the course.
const EXPECTED_TOPIC_SLUGS = TOPICS.map((t) => t.slug).sort().join(",");

// Bump this whenever lecture bodies, assignment problems, or correct answers
// change in a way that should propagate to the database on the next boot.
// The value is stored alongside topics and compared in seedIfEmpty.
const CONTENT_REVISION = "2026-06-28.ai-logic.r1";

// A sentinel phrase present in exactly one lecture body — used to detect that
// the database holds the *current* revision of the content (not just a set of
// matching slugs). Bump whenever the seed content is overhauled.
const REVISION_SENTINEL_SLUG = "concept-of-inference";
const REVISION_SENTINEL_PHRASE = "forming a new belief on the basis of an old one";

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as n from topics`);
  const row = (existing.rows[0] ?? {}) as { n?: number };
  const count = row.n ?? 0;

  if (count > 0) {
    const rows = await db.execute(sql`select slug from topics order by slug`);
    const actualSlugs = (rows.rows as Array<{ slug: string }>)
      .map((r) => r.slug)
      .sort()
      .join(",");
    const slugsMatch = actualSlugs === EXPECTED_TOPIC_SLUGS;
    let revisionMatches = false;
    try {
      const sentinelLec = await db.execute(
        sql`select l.body from lectures l join topics t on l.topic_id = t.id where t.slug = ${REVISION_SENTINEL_SLUG} limit 1`,
      );
      const body = ((sentinelLec.rows[0] ?? {}) as { body?: string }).body ?? "";
      revisionMatches = body.includes(REVISION_SENTINEL_PHRASE);
    } catch {
      revisionMatches = false;
    }
    if (slugsMatch && revisionMatches) {
      logger.info(
        { revision: CONTENT_REVISION },
        "Seed: already populated with current content, skipping",
      );
      return;
    }
    logger.info(
      { revision: CONTENT_REVISION, slugsMatch, revisionMatches },
      "Seed: course content drifted from expected revision — wiping and re-seeding",
    );
    // Order matters: child tables first.
    await db.execute(sql`delete from practice_attempts`);
    await db.execute(sql`delete from practice_problems`);
    await db.execute(sql`delete from practice_sessions`);
    await db.execute(sql`delete from answers`);
    await db.execute(sql`delete from attempts`);
    await db.execute(sql`delete from problems`);
    await db.execute(sql`delete from assignments`);
    await db.execute(sql`delete from lectures`);
    await db.execute(sql`delete from topics`);
  }

  logger.info("Seed: populating course content");

  // Topics + lectures
  const slugToTopicId = new Map<string, number>();
  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i]!;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
    slugToTopicId.set(t.slug, inserted.id);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
  }

  // Assignments + problems
  for (let i = 0; i < ASSIGNMENTS.length; i++) {
    const a = ASSIGNMENTS[i]!;
    const [inserted] = await db
      .insert(assignmentsTable)
      .values({
        kind: a.kind,
        title: a.title,
        weekNumber: a.weekNumber,
        position: i,
        isTimed: a.isTimed,
        timeLimitMinutes: a.timeLimitMinutes,
        instructions: a.instructions,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
    for (let p = 0; p < a.problems.length; p++) {
      const prob = a.problems[p]!;
      const topicId = slugToTopicId.get(prob.topicSlug);
      if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
      await db.insert(problemsTable).values({
        assignmentId: inserted.id,
        topicId,
        position: p,
        prompt: prob.prompt,
        correctAnswer: prob.correctAnswer,
        explanation: prob.explanation,
        hint: prob.hint ?? null,
      });
    }
  }

  logger.info({ topics: TOPICS.length, assignments: ASSIGNMENTS.length }, "Seed complete");
}
