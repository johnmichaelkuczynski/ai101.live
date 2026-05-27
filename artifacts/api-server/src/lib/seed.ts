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
  // Week 1 — The number systems
  // ───────────────────────────────────────────────────────────────
  {
    slug: "counting-integers-numberline",
    title: "Counting, the integers, and the number line",
    weekNumber: 1,
    blurb: "From tally marks to a continuous line of integers.",
    lectureTitle: "1.1 Counting, the integers, and the number line",
    body: `# Counting, the integers, and the number line

Mathematics begins with *counting*. The natural numbers $\\mathbb{N} = \\{1, 2, 3, \\ldots\\}$ — or $\\{0, 1, 2, \\ldots\\}$, depending on the author — are the answer to "how many?" They are discrete, ordered, and unbounded above.

Extending counting in the opposite direction gives the **integers** $\\mathbb{Z} = \\{\\ldots, -2, -1, 0, 1, 2, \\ldots\\}$. The letter $\\mathbb{Z}$ comes from German *Zahlen* ("numbers"). What makes $\\mathbb{Z}$ a genuine *extension* of $\\mathbb{N}$ is that subtraction is now always defined: $3 - 5 = -2$ has no answer in $\\mathbb{N}$, but it does in $\\mathbb{Z}$.

## The number line

Around 1600, John Wallis popularized the picture of integers as evenly-spaced points on a horizontal **line** stretching to infinity in both directions. The visual is so familiar we forget it is a *modeling choice*: we are asserting that numbers, which began life as counts of distinct objects, can be identified with positions on a continuum.

That single picture quietly unifies arithmetic with geometry. Addition becomes translation; negation becomes reflection through $0$; ordering ($<$, $>$) becomes "left of, right of." Every later number system — the rationals, the reals, the complex numbers — is built by adding more points to (or stacking more lines onto) this single mental object.

## A historical example

Negative numbers were rejected as absurd in Europe until the 17th century — Cardano (1545) called them *numeri ficti*, "fictitious numbers." What changed minds was *bookkeeping*: a debt of seven coins is structurally a $-7$, and treating it as a number lets you add receipts and debts in one column. The number line absorbed the negatives by giving them a home: a *place* to stand, on the left of zero.`,
  },
  {
    slug: "rationals-ratios",
    title: "Rational numbers and ratios",
    weekNumber: 1,
    blurb: "Numbers as ratios of integers; why $\\mathbb{Q}$ is dense.",
    lectureTitle: "1.2 Rational numbers and ratios",
    body: `# Rational numbers and ratios

A **rational number** is a ratio $p/q$ of integers with $q \\neq 0$. The set of all such ratios, with two representations identified when they cross-multiply equal, is

$$\\mathbb{Q} = \\{\\,p/q : p, q \\in \\mathbb{Z},\\ q \\neq 0\\,\\}.$$

The point of this construction is to make *division* always work — exactly as the integers existed to make subtraction always work.

## Density

Between any two rationals, no matter how close, there is another rational: take their average. Iterate, and you discover that the rationals are **dense** on the number line — there are no "gaps" between them as far as any finite measurement could ever detect.

This is so counterintuitive that for centuries mathematicians assumed the rationals already filled the line. They do not — but you cannot tell from the inside.

## A scientific example

Every measurement humans actually make is rational. A digital scale reading "$1.732\\,\\text{kg}$" is asserting $1732/1000$. The speed of light in SI units, $c = 299{,}792{,}458\\,\\text{m/s}$, is an *exact* integer by definition since 1983 — and therefore rational.

## Ratios vs. fractions

The word *ratio* in $\\mathbb{Q}$ matters. Pythagoras taught that the harmony of a musical interval is a ratio of small integers: the octave is $2{:}1$, the perfect fifth $3{:}2$, the perfect fourth $4{:}3$. Greek mathematics for two centuries was essentially the study of *ratios of magnitudes*, on the implicit assumption that any two magnitudes had one. The next lecture is the story of how that assumption broke.`,
  },
  {
    slug: "irrationals-sqrt2",
    title: "Irrational numbers and the $\\sqrt 2$ scandal",
    weekNumber: 1,
    blurb: "The diagonal of the unit square is not a ratio.",
    lectureTitle: "1.3 Irrational numbers and the $\\sqrt 2$ scandal",
    body: `# Irrational numbers and the $\\sqrt 2$ scandal

The Pythagoreans believed every length was a ratio of two integers — that is, every length was rational. The unit square killed that belief.

## The diagonal

By the Pythagorean theorem, the diagonal of a square of side $1$ has length $d$ with $d^2 = 1^2 + 1^2 = 2$, so $d = \\sqrt 2$. The Pythagoreans tried to write $\\sqrt 2 = p/q$ and discovered they could not.

## The proof by contradiction

Suppose $\\sqrt 2 = p/q$ in lowest terms. Then $p^2 = 2 q^2$, so $p^2$ is even, so $p$ is even, so $p = 2k$. Substituting: $4k^2 = 2q^2$, i.e. $q^2 = 2k^2$, so $q$ is even too. But then $p$ and $q$ share a factor of $2$ — contradicting "lowest terms." Therefore no such $p/q$ exists. $\\sqrt 2 \\notin \\mathbb{Q}$.

This is one of the oldest theorems in mathematics and one of the cleanest examples of *proof by contradiction*, a technique we will revisit in week 4.

## A scandal, not just a result

Legend says Hippasus of Metapontum, who first proved this, was thrown overboard by his fellow Pythagoreans for revealing the result. Whether or not the drowning happened, the cultural shock was real: the entire Pythagorean cosmology — "all is number" meaning "all is ratio of integers" — collapsed. A new kind of number was needed.

## The bigger picture

$\\sqrt 2$, $\\pi$, $e$, $\\log_2 3$, and almost every number you can write down are irrational. The irrationals are not a few exotic exceptions sprinkled into $\\mathbb{Q}$; they are, in a precise sense we will quantify in 1.8, the *overwhelming majority* of the real numbers.`,
  },
  {
    slug: "reals-completeness",
    title: "Real numbers and completeness",
    weekNumber: 1,
    blurb: "Filling in the gaps: $\\mathbb{R}$ has no holes.",
    lectureTitle: "1.4 Real numbers and completeness",
    body: `# Real numbers and completeness

The rationals are dense but full of holes — $\\sqrt 2$, $\\pi$, and uncountably many others are missing. The **real numbers** $\\mathbb{R}$ are the result of filling in *every* such hole.

## What "complete" means

A number system is **complete** if every "convergent-looking" sequence actually converges to something *inside the system*. Two precise versions of this idea:

- **Least Upper Bound axiom.** Every nonempty subset of $\\mathbb{R}$ with an upper bound has a least upper bound (a supremum) in $\\mathbb{R}$.
- **Cauchy completeness.** Every sequence whose terms get arbitrarily close to each other converges to a real limit.

In $\\mathbb{Q}$ both properties *fail*. The sequence $1, 1.4, 1.41, 1.414, 1.4142, \\ldots$ of decimal approximations to $\\sqrt 2$ is a Cauchy sequence of rationals with no rational limit. In $\\mathbb{R}$ its limit is $\\sqrt 2$, which is, by construction, *in* $\\mathbb{R}$.

## How $\\mathbb{R}$ is built

Two classical constructions:

1. **Dedekind cuts** (1872). A real number is a partition of $\\mathbb{Q}$ into a "lower" and "upper" set with no greatest element below. $\\sqrt 2$ is the cut $\\{q \\in \\mathbb{Q} : q^2 < 2\\}\\,|\\,\\{q \\in \\mathbb{Q} : q^2 > 2\\}$.
2. **Cauchy sequences** (Cantor, 1872). A real number is an equivalence class of Cauchy sequences of rationals.

Both constructions yield the same field $\\mathbb{R}$, up to isomorphism.

## A scientific example

In physics, the *continuum* hypothesis — that space and time are modeled by $\\mathbb{R}$, not $\\mathbb{Q}$ — is what lets us write down differential equations. The reals' completeness is exactly what guarantees that, e.g., Newton's $F = ma$ has solutions; in the rationals alone, most ODEs would have no solution to converge to.`,
  },
  {
    slug: "complex-rotations",
    title: "Imaginary and complex numbers as rotations",
    weekNumber: 1,
    blurb: "$i$ is not mysterious — it's a $90°$ turn.",
    lectureTitle: "1.5 Imaginary and complex numbers as rotations",
    body: `# Imaginary and complex numbers as rotations

A **complex number** has the form $z = a + bi$ with $a, b \\in \\mathbb{R}$ and $i$ defined by $i^2 = -1$. The set of all such numbers is $\\mathbb{C}$.

## The leap

Cardano (1545) used $\\sqrt{-1}$ as a *bookkeeping device* in solving cubic equations — the imaginary parts cancelled at the end, leaving real roots. For two centuries $\\sqrt{-1}$ remained, in Euler's words, "neither nothing, nor greater than nothing, nor less than nothing." The mystery was: *what is it the number of?*

## The Argand picture

Caspar Wessel (1799) and Jean-Robert Argand (1806) independently noticed that complex numbers live not on a *line* but on a *plane*: identify $a + bi$ with the point $(a, b)$. Real numbers occupy the horizontal axis. The number $i$ sits at $(0, 1)$.

In this picture, **multiplication by $i$ is rotation by $90°$**. Multiplying by $i$ twice rotates by $180°$, which is multiplication by $-1$ — and that is precisely the equation $i^2 = -1$. The imaginary unit is not a mystery; it is the quarter-turn.

More generally, multiplying by $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$ rotates the plane by angle $\\theta$. This is **Euler's formula**, and the special case $e^{i\\pi} + 1 = 0$ packages five fundamental constants in seven symbols.

## A scientific example

Alternating current in electrical engineering is described by complex *impedances*: a resistor contributes a real number, a capacitor or inductor contributes an imaginary number. The phase shift between voltage and current is literally an angle in the complex plane. Without $i$, you would write coupled trigonometric differential equations; with $i$, you write algebra.`,
  },
  {
    slug: "zero-negatives-leaps",
    title: "Zero, negatives, and other conceptual leaps",
    weekNumber: 1,
    blurb: "How long it took to accept the numbers we now take for granted.",
    lectureTitle: "1.6 Zero, negatives, and other conceptual leaps",
    body: `# Zero, negatives, and other conceptual leaps

The set $\\{0, 1, -3, \\sqrt 2, \\pi, i\\}$ contains nothing exotic to a modern eye. To the mathematicians who lived through the introduction of each of these ideas, every entry was scandalous.

## Zero

Most early number systems had no $0$. The Babylonians, Greeks, and Romans counted with words for "nothing" but no *numeral* for it — Roman numerals have no zero. Indian mathematicians (Brahmagupta, c. 628 CE) wrote down the first formal arithmetic rules for $0$: $a + 0 = a$, $a \\cdot 0 = 0$, and the still-debated $a / 0$. The numeral itself, *śūnya* ("emptiness"), travelled west via Arabic mathematicians and reached Europe through Fibonacci's *Liber Abaci* (1202). Even then, several Italian cities banned zero into the 1300s on the grounds that it made accounting forgery easier.

## Negatives

Diophantus (3rd c. CE) called the equation $4x + 20 = 4$ "absurd" because its solution would have to be negative. Descartes (1637) called negative roots of polynomial equations *fausses racines*, "false roots." Acceptance only came when negatives modelled something — debt, direction, signed measurement — that could not be wished away.

## Irrationals, transcendentals, $i$

Each new kind of number arrived as a forced response to an equation the previous system could not solve:

- $x + 1 = 0$ forces $\\mathbb{Z}$.
- $2x = 1$ forces $\\mathbb{Q}$.
- $x^2 = 2$ forces $\\mathbb{R}$ (or at least the algebraic reals).
- $x^2 + 1 = 0$ forces $\\mathbb{C}$.

## The lesson

A *conceptual leap* in mathematics is almost always the recognition that an object the previous generation called "impossible" is in fact useful, consistent, and indispensable. The reluctance is cultural, not logical.`,
  },
  {
    slug: "bases-place-value",
    title: "Bases, place value, and representation",
    weekNumber: 1,
    blurb: "A number is one thing; its written form is another.",
    lectureTitle: "1.7 Bases, place value, and representation",
    body: `# Bases, place value, and representation

The number *seventeen* is a single concept. Its written representations include:

- $17$ in base $10$
- $10001$ in base $2$
- $11$ in base $16$ (often written $0x11$)
- XVII in Roman numerals
- 一十七 in Chinese.

The number is invariant; the *numeral* changes with the convention.

## Place value

In a positional system of base $b$, the string $d_k d_{k-1} \\ldots d_1 d_0$ means

$$d_k b^k + d_{k-1} b^{k-1} + \\cdots + d_1 b + d_0,$$

with each digit $d_i$ in $\\{0, 1, \\ldots, b-1\\}$. The *position* of a digit determines what power of $b$ it contributes. This is the deep insight that the Romans lacked: in Roman numerals, $X$ always means ten, no matter where it sits.

Place value lets you do arithmetic algorithmically: add column by column, carry when a column overflows. Try long-division in Roman numerals — you can't, which is why the Roman world used an abacus.

## Why base 10?

There is no mathematical reason for base 10. We use it because humans have ten fingers. The Babylonians used base 60 — you still find it in time ($60$ seconds, $60$ minutes) and angles ($360°$). The Maya used base 20. Modern computers use base 2.

## A scientific example

Floating-point arithmetic in a computer represents a real number as $\\pm m \\cdot 2^{e}$, with the *mantissa* $m$ and *exponent* $e$ both stored in binary. The number $0.1$ has a finite decimal representation but an *infinite* binary one — which is why "0.1 + 0.2" is not exactly "0.3" in JavaScript. The mathematical number is fine; its representation in base $2$ rounds.

## A philosophical aside

Once you separate a number from its representation, you can ask: which properties of a number are intrinsic, and which are artifacts of how we wrote it? "Is 7 a prime?" is intrinsic. "Does the decimal expansion of 7 contain the digit 3?" is representational.`,
  },
  {
    slug: "countable-uncountable",
    title: "Countable vs. uncountable infinity",
    weekNumber: 1,
    blurb: "There are more reals than rationals — strictly more.",
    lectureTitle: "1.8 Countable vs. uncountable infinity",
    body: `# Countable vs. uncountable infinity

For finite sets, "same size" means "same count." For infinite sets, Cantor (1874) showed that "same size" must mean **same cardinality**: there is a one-to-one correspondence (a bijection) between them.

## Countable

A set is **countable** if it can be put in bijection with $\\mathbb{N}$. Astonishingly:

- $\\mathbb{Z}$ is countable: list $0, 1, -1, 2, -2, 3, -3, \\ldots$
- $\\mathbb{N} \\times \\mathbb{N}$ is countable: walk diagonals $(0,0), (1,0), (0,1), (2,0), (1,1), (0,2), \\ldots$
- $\\mathbb{Q}$ is countable: a rational $p/q$ is a pair of integers, so apply the previous result.

So all three of $\\mathbb{N}$, $\\mathbb{Z}$, $\\mathbb{Q}$ have the *same* infinite size. Cantor called this size $\\aleph_0$ ("aleph-null").

## Uncountable

Cantor's **diagonal argument** shows $\\mathbb{R}$ is **not** countable. Suppose, for contradiction, you had a list $r_1, r_2, r_3, \\ldots$ of every real number in $[0,1]$. Write each $r_n$ as a decimal:

$$r_1 = 0.d_{11} d_{12} d_{13} \\ldots$$
$$r_2 = 0.d_{21} d_{22} d_{23} \\ldots$$
$$\\vdots$$

Now construct a new number $x = 0.e_1 e_2 e_3 \\ldots$ where $e_n$ is *different* from $d_{nn}$ (say, $e_n = 5$ if $d_{nn} \\neq 5$, else $e_n = 6$). By construction, $x$ differs from $r_n$ in the $n$th decimal place, so $x$ is not on the list — yet $x \\in [0,1]$. Contradiction. There is no such list.

The cardinality of $\\mathbb{R}$ is strictly greater than $\\aleph_0$; it is usually written $\\mathfrak{c}$ or $2^{\\aleph_0}$.

## What this means

There are infinitely many sizes of infinity. The rationals are sparse compared to the reals in a precise sense: if you "pick a random real," the probability you get a rational is exactly $0$. Most numbers — almost all of them — are irrational, in fact *transcendental*, and we cannot write them down.

This week we have climbed from counting to a hierarchy of infinities. Next week we ask: what are we *doing* to these numbers when we add, multiply, and group them?`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 2 — Operations and structures
  // ───────────────────────────────────────────────────────────────
  {
    slug: "what-is-operation",
    title: "What an operation is",
    weekNumber: 2,
    blurb: "An operation is a function that combines elements of a set.",
    lectureTitle: "2.1 What an operation is",
    body: `# What an operation is

We have spent week 1 collecting numbers. Now we ask: what is happening when we *combine* them?

## The formal definition

A **binary operation** on a set $S$ is a function

$$* : S \\times S \\to S$$

that takes two elements of $S$ and returns one element of $S$. Addition on $\\mathbb{R}$ is one ($+ : \\mathbb{R} \\times \\mathbb{R} \\to \\mathbb{R}$). So is multiplication. So is concatenation of strings, union of sets, composition of functions.

The deep word in that definition is the codomain: the result is required to be *in $S$*. This is called **closure**, and it is not automatic.

## Closure: not automatic

- Subtraction is a binary operation on $\\mathbb{Z}$ but **not** on $\\mathbb{N}$ — $3 - 5 = -2 \\notin \\mathbb{N}$.
- Division is a binary operation on $\\mathbb{Q}^{\\times} = \\mathbb{Q}\\setminus\\{0\\}$ but **not** on $\\mathbb{Q}$ — you cannot divide by $0$.
- The cross product is a binary operation on $\\mathbb{R}^3$ but does not generalize as a binary operation to $\\mathbb{R}^n$ for arbitrary $n$.

The history of week 1 — the introduction of negatives, fractions, irrationals, complex numbers — is, retold structurally, the story of *enlarging the set so that the operation has closure*.

## Unary and $n$-ary

Beyond binary, you also have:

- **Unary** operations: negation $x \\mapsto -x$, square root $x \\mapsto \\sqrt x$.
- **$n$-ary** operations: e.g. the determinant of an $n \\times n$ matrix.
- **Nullary** operations (constants): the identity element $0$ of addition, the identity element $1$ of multiplication.

## A scientific example

In quantum mechanics, the operation $[A, B] = AB - BA$ on linear operators is a binary operation called the **commutator**. It is *not* closed under all combinations — its very failure of niceness encodes the uncertainty principle. The operation has been chosen because its violations of nice structure tell you something physical.`,
  },
  {
    slug: "commutative-associative-distributive",
    title: "Commutativity, associativity, distributivity",
    weekNumber: 2,
    blurb: "Three structural laws — and what happens when they fail.",
    lectureTitle: "2.2 Commutativity, associativity, distributivity",
    body: `# Commutativity, associativity, distributivity

Once we have an operation $*$ on a set $S$, three properties dominate the discussion.

## Commutativity

$$a * b = b * a \\quad \\text{for all } a, b \\in S.$$

Order doesn't matter. Addition and multiplication of real numbers are commutative. Subtraction is **not** — $3 - 5 \\neq 5 - 3$. Function composition is usually **not** — $\\sin(\\cos x) \\neq \\cos(\\sin x)$ in general. Matrix multiplication is **not** — and this failure is the whole content of quantum mechanics' non-commuting observables.

## Associativity

$$(a * b) * c = a * (b * c) \\quad \\text{for all } a, b, c \\in S.$$

Grouping doesn't matter. Without associativity you cannot write $a*b*c$ unambiguously; you would have to specify which pair to combine first. Addition, multiplication, function composition, and matrix multiplication are all associative. Subtraction and the cross product are **not** — $(1-2)-3 = -4 \\neq 2 = 1 - (2-3)$, and $(\\vec a \\times \\vec b) \\times \\vec c \\neq \\vec a \\times (\\vec b \\times \\vec c)$ in general.

## Distributivity

With two operations $*$ and $\\circ$ on the same set, $*$ **distributes over** $\\circ$ if

$$a * (b \\circ c) = (a * b) \\circ (a * c).$$

Multiplication distributes over addition: $a(b + c) = ab + ac$. Addition does **not** distribute over multiplication: $a + (bc) \\neq (a + b)(a + c)$ in general.

## Why these three?

These three laws are not arbitrary — they are exactly the laws that make algebraic *manipulation* work. Solving $2x + 3 = 11$ silently uses every one of them. Without commutativity of addition, the order of the terms would matter. Without associativity, $2x + 3$ would be ambiguous. Without distributivity, you could not factor or expand.

Modern abstract algebra is the systematic study of *which combinations of these laws hold*, and *what consequences each combination has*. The next four lectures are tour stops on that map.`,
  },
  {
    slug: "groups-symmetry",
    title: "Groups and symmetry",
    weekNumber: 2,
    blurb: "A group is a set with an invertible, associative operation.",
    lectureTitle: "2.3 Groups and symmetry",
    body: `# Groups and symmetry

A **group** is a set $G$ together with a binary operation $* : G \\times G \\to G$ satisfying four axioms:

1. **Closure.** For all $a, b \\in G$, $a * b \\in G$.
2. **Associativity.** $(a*b)*c = a*(b*c)$ for all $a, b, c$.
3. **Identity.** There exists $e \\in G$ with $e*a = a*e = a$ for all $a$.
4. **Inverses.** For every $a \\in G$ there exists $a^{-1} \\in G$ with $a*a^{-1} = a^{-1}*a = e$.

If, in addition, $a*b = b*a$ for all $a,b$, the group is **abelian**.

## Examples

- $(\\mathbb{Z}, +)$, $(\\mathbb{Q}, +)$, $(\\mathbb{R}, +)$, $(\\mathbb{C}, +)$ — abelian groups under addition; identity $0$.
- $(\\mathbb{Q}^{\\times}, \\cdot)$, $(\\mathbb{R}^{\\times}, \\cdot)$ — abelian groups under multiplication (after removing $0$); identity $1$.
- $S_n$, the **symmetric group** — permutations of $n$ objects under composition. Non-abelian for $n \\ge 3$.
- The set of rotations of an equilateral triangle (identity, $120°$, $240°$) under composition.

## Groups are symmetries

The headline theorem (Cayley, 1854): every group is isomorphic to a group of permutations. A more useful way to say it: a group is *the set of symmetries of something*.

- The symmetries of a square form a group of order $8$ (the dihedral group $D_4$): four rotations $\\times$ two flips.
- The symmetries of a circle form an *infinite* group: every rotation by every real angle.
- The symmetries of an equation are a group, called its Galois group, and they decide whether the equation is solvable by radicals (Galois, 1832).

This single insight — that *symmetry is a group* — pervades modern mathematics and physics. Noether's theorem (1918) says every continuous symmetry of a physical system gives a conserved quantity: time-translation symmetry $\\Rightarrow$ conservation of energy; rotational symmetry $\\Rightarrow$ conservation of angular momentum.

## A scientific example

The set of $3 \\times 3$ rotation matrices $SO(3)$ is the group of rotations of physical space. It is non-abelian: rotating $90°$ about the $x$-axis then $90°$ about the $y$-axis is a different physical rotation than doing them in the opposite order. Try it with a book — that non-commutativity is a real fact about the geometry of 3D space.`,
  },
  {
    slug: "rings-fields",
    title: "Rings and fields",
    weekNumber: 2,
    blurb: "Two operations playing well together: addition and multiplication.",
    lectureTitle: "2.4 Rings and fields",
    body: `# Rings and fields

A group has one operation. The familiar number systems have two — and the way the two interact is what gives arithmetic its power.

## Ring

A **ring** $R$ is a set with two operations, traditionally $+$ and $\\cdot$, such that:

- $(R, +)$ is an abelian group with identity $0$.
- $(R, \\cdot)$ is associative and has an identity $1$ (in a **ring with unity**).
- Multiplication distributes over addition: $a(b+c) = ab + ac$ and $(b+c)a = ba + ca$.

Note: multiplication is not required to be commutative, and elements are not required to have multiplicative inverses.

## Examples of rings

- $\\mathbb{Z}$, $\\mathbb{Q}$, $\\mathbb{R}$, $\\mathbb{C}$ — all commutative rings with unity.
- $M_n(\\mathbb{R})$, the $n \\times n$ real matrices — a **noncommutative** ring under matrix addition and multiplication.
- $\\mathbb{R}[x]$, polynomials in $x$ with real coefficients — a commutative ring.
- $\\mathbb{Z}/n\\mathbb{Z}$, the integers modulo $n$ — see lecture 2.8.

## Field

A **field** $F$ is a commutative ring in which every nonzero element has a multiplicative inverse. Equivalently: $(F\\setminus\\{0\\}, \\cdot)$ is an abelian group.

- $\\mathbb{Q}$, $\\mathbb{R}$, $\\mathbb{C}$ are fields.
- $\\mathbb{Z}$ is **not** a field: $2$ has no integer inverse.
- $\\mathbb{Z}/p\\mathbb{Z}$ is a field exactly when $p$ is prime.

## Why these axioms?

A field is precisely the abstract setting in which the entire toolkit of high-school algebra — solving linear equations, dividing both sides, manipulating fractions — works. Once you know "these axioms hold," you get all the theorems for free, whether the field is $\\mathbb{R}$ or the integers mod $7$ or the rational functions over $\\mathbb{C}$.

## A scientific example

The finite field $\\mathbb{F}_{2^8}$ with $256$ elements is the arithmetic backbone of the AES encryption standard that protects most of the world's internet traffic. The S-box of AES is, definitionally, multiplicative inversion in this field followed by an affine map. Every secure HTTPS connection you make is computing in a 256-element field on your behalf.`,
  },
  {
    slug: "vector-spaces",
    title: "Vector spaces and linear combination",
    weekNumber: 2,
    blurb: "Adding arrows and scaling them — the universal language of linear math.",
    lectureTitle: "2.5 Vector spaces and linear combination",
    body: `# Vector spaces and linear combination

A **vector space** $V$ over a field $F$ is a set whose elements (**vectors**) can be added to each other and scaled by elements of $F$ (**scalars**), subject to a short list of axioms:

- $(V, +)$ is an abelian group.
- For all $\\alpha, \\beta \\in F$ and $v, w \\in V$:
  - $\\alpha(v + w) = \\alpha v + \\alpha w$
  - $(\\alpha + \\beta) v = \\alpha v + \\beta v$
  - $(\\alpha \\beta) v = \\alpha(\\beta v)$
  - $1 \\cdot v = v$.

## Examples

- $\\mathbb{R}^n$, ordered $n$-tuples of real numbers, with componentwise addition and scalar multiplication. The prototype example.
- The set of all polynomials with real coefficients, $\\mathbb{R}[x]$, under polynomial addition and scaling.
- The set of all continuous functions $f : [0,1] \\to \\mathbb{R}$, under pointwise addition.
- The set of solutions to a linear homogeneous differential equation.

The same axioms apply to all of these — and so the same theorems do.

## Linear combinations, span, basis

A **linear combination** of vectors $v_1, \\ldots, v_k$ is an expression

$$\\alpha_1 v_1 + \\alpha_2 v_2 + \\cdots + \\alpha_k v_k, \\quad \\alpha_i \\in F.$$

The set of all linear combinations of a fixed list is its **span**. A list is **linearly independent** if no vector in it is a linear combination of the others. A **basis** is a linearly independent list whose span is all of $V$. The number of vectors in any basis is the **dimension** of $V$.

## Why this matters

Most of physics, signal processing, machine learning, and computer graphics is the systematic exploitation of vector-space structure. Fourier analysis says: the space of "nice" functions has a basis of sines and cosines, so any signal is a linear combination of pure tones. Principal component analysis says: high-dimensional data can usually be approximated in a low-dimensional subspace.

## A scientific example

A quantum state of a spin-$\\tfrac{1}{2}$ particle is a unit vector in the complex vector space $\\mathbb{C}^2$. The basis $\\{|{\\uparrow}\\rangle, |{\\downarrow}\\rangle\\}$ is "spin up" and "spin down" along a chosen axis. Every other state — including the "superposition" states that drive every paradox of quantum mechanics — is a linear combination $\\alpha|{\\uparrow}\\rangle + \\beta|{\\downarrow}\\rangle$. The famous mystery is entirely the linearity.`,
  },
  {
    slug: "functions-mappings",
    title: "Functions as mappings",
    weekNumber: 2,
    blurb: "A function is a rule that sends every input to exactly one output.",
    lectureTitle: "2.6 Functions as mappings",
    body: `# Functions as mappings

A **function** $f : A \\to B$ is a rule that assigns to *every* element $a$ of the **domain** $A$ exactly one element $f(a)$ of the **codomain** $B$.

The set $f(A) = \\{f(a) : a \\in A\\} \\subseteq B$ is the **image** (or range). The codomain $B$ is the place where outputs are *allowed* to live; the image is the subset they actually hit.

## Three classifications

- **Injective** (one-to-one): different inputs give different outputs. $f(a_1) = f(a_2) \\Rightarrow a_1 = a_2$.
- **Surjective** (onto): every element of the codomain is hit. $f(A) = B$.
- **Bijective**: both. Bijections are precisely the functions that have a two-sided inverse $f^{-1} : B \\to A$.

A bijection $f : A \\to B$ is, in essence, a *renaming* of $A$'s elements as $B$'s elements. Two sets have the same cardinality (1.8) iff there is a bijection between them.

## Composition

Functions compose: if $f : A \\to B$ and $g : B \\to C$, then $g \\circ f : A \\to C$ is the function $a \\mapsto g(f(a))$. Composition is **associative** but generally **not** commutative.

The set of bijections of a fixed set $X$ to itself, under composition, is a group — the symmetric group $S_X$. This is the bridge from "function" back to "group."

## Functions vs. formulas

A function is *not* a formula. A formula is one way to *describe* a function. The function $f : \\mathbb{R} \\to \\mathbb{R}$, $f(x) = x^2$ can equally well be described as $f(x) = |x|^2$, $f(x) = x \\cdot x$, or by a table or by a graph. They are all the same function: same domain, same codomain, same input-to-output rule.

## A scientific example

Crystallography classifies crystals by their **symmetry group** — the group of geometric transformations $f : \\mathbb{R}^3 \\to \\mathbb{R}^3$ that map the crystal to itself. There are exactly $230$ such groups in 3D (the *crystallographic space groups*), determined a century ago, and every real crystal falls into exactly one of them.`,
  },
  {
    slug: "relations-equivalence-iso",
    title: "Relations, equivalence classes, and isomorphism",
    weekNumber: 2,
    blurb: "Sameness, refined: when do two different things count as the same?",
    lectureTitle: "2.7 Relations, equivalence classes, and isomorphism",
    body: `# Relations, equivalence classes, and isomorphism

A **relation** on a set $S$ is a subset $R \\subseteq S \\times S$. We write $a \\sim b$ for $(a, b) \\in R$. An **equivalence relation** is one satisfying three properties:

1. **Reflexive.** $a \\sim a$ for all $a$.
2. **Symmetric.** $a \\sim b \\Rightarrow b \\sim a$.
3. **Transitive.** $a \\sim b$ and $b \\sim c \\Rightarrow a \\sim c$.

## Equivalence classes

Given an equivalence relation $\\sim$ on $S$, the **equivalence class** of $a$ is

$$[a] = \\{x \\in S : x \\sim a\\}.$$

The classes form a **partition** of $S$: every element is in exactly one class, and the classes don't overlap. Conversely, every partition of $S$ defines an equivalence relation.

## Examples

- "Has the same birthday as" on the set of all humans. The classes have at most $366$ elements each.
- $a \\sim b$ iff $a - b \\in \\mathbb{Z}$, on $\\mathbb{R}$. Each class is the set of reals with a given fractional part. The quotient set is the circle $\\mathbb{R}/\\mathbb{Z}$.
- $a \\sim b$ iff $a - b$ is divisible by $5$, on $\\mathbb{Z}$. The classes are $\\{[0], [1], [2], [3], [4]\\}$ — the integers mod $5$ (lecture 2.8).

Every time mathematicians say "consider $X$ up to $\\sim$," they are forming a quotient set by an equivalence relation.

## Isomorphism: the deepest equivalence

Two algebraic objects — two groups, two rings, two vector spaces — are **isomorphic** when there is a bijection between them that preserves the operations. Symbolically, $G \\cong H$.

Isomorphism says: $G$ and $H$ are "the same object, with different names for the elements." Every property expressible in the language of the structure transfers across an isomorphism.

## A scientific example

The group $(\\mathbb{R}, +)$ and the group $(\\mathbb{R}_{>0}, \\cdot)$ are isomorphic: the bijection $x \\mapsto e^x$ sends $a + b$ to $e^{a+b} = e^a \\cdot e^b$. This isomorphism is exactly what makes the **logarithm** useful: it lets you convert a hard multiplication problem into an easier addition problem (the principle behind slide rules and log tables).`,
  },
  {
    slug: "modular-arithmetic",
    title: "Modular arithmetic",
    weekNumber: 2,
    blurb: "Clock arithmetic, and the basis of modern cryptography.",
    lectureTitle: "2.8 Modular arithmetic",
    body: `# Modular arithmetic

Fix a positive integer $n$, called the **modulus**. Define an equivalence relation on $\\mathbb{Z}$ by

$$a \\equiv b \\pmod n \\iff n \\mid (a - b).$$

The equivalence classes are $[0], [1], \\ldots, [n-1]$. The set of classes is denoted $\\mathbb{Z}/n\\mathbb{Z}$ or $\\mathbb{Z}_n$.

The miracle is that addition and multiplication on $\\mathbb{Z}$ **descend** to operations on $\\mathbb{Z}/n\\mathbb{Z}$: $[a] + [b] = [a+b]$ and $[a] \\cdot [b] = [ab]$, with the answer independent of which representative you chose. So $\\mathbb{Z}/n\\mathbb{Z}$ is itself a ring (lecture 2.4) — a finite one, with $n$ elements.

## Clock arithmetic

The most familiar example is $\\mathbb{Z}/12\\mathbb{Z}$ — the integers mod $12$. If it is $9$ o'clock and you wait $5$ hours, the clock reads $9 + 5 \\equiv 2 \\pmod{12}$. Every act of telling time is modular arithmetic.

## When is $\\mathbb{Z}/n\\mathbb{Z}$ a field?

$\\mathbb{Z}/n\\mathbb{Z}$ is a field iff $n$ is **prime**. For $n = p$ prime, every nonzero class has a multiplicative inverse (by Bézout's lemma), so you can divide. For $n$ composite, this fails: in $\\mathbb{Z}/6\\mathbb{Z}$, $2 \\cdot 3 = 6 \\equiv 0$ — two nonzero elements multiplying to zero, which a field forbids.

## Fermat's Little Theorem

For prime $p$ and integer $a$ not divisible by $p$,

$$a^{p-1} \\equiv 1 \\pmod p.$$

This single congruence is the backbone of:

- **Primality testing.** Probabilistic tests (Miller–Rabin) check whether a candidate $n$ satisfies an analogue of FLT; failure is a *proof* $n$ is composite.
- **RSA encryption.** Picking two large primes $p$ and $q$ and computing $n = pq$, the security of every RSA-encrypted email and SSH connection rests on the difficulty of recovering $p$ and $q$ from $n$, combined with the modular-exponentiation identities that FLT provides.

## The point

Modular arithmetic is what week 2 was building toward: a small, *finite* number system that nonetheless obeys the field axioms of lecture 2.4, supports linear algebra (lecture 2.5), and has nontrivial groups (lecture 2.3) sitting inside it. It is also one of the most economically valuable structures in mathematics — virtually all of public-key cryptography is computation in $\\mathbb{Z}/n\\mathbb{Z}$.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 3 — The continuum: calculus, geometry, topology
  // ───────────────────────────────────────────────────────────────
  {
    slug: "limits-taming-infinity",
    title: "Limits and the taming of infinity",
    weekNumber: 3,
    blurb: "Making 'gets arbitrarily close to' a precise idea.",
    lectureTitle: "3.1 Limits and the taming of infinity",
    body: `# Limits and the taming of infinity

For two thousand years, mathematicians used phrases like "infinitely small" and "approaches but never reaches" without a rigorous definition. The 19th century replaced the metaphor with arithmetic.

## The $\\varepsilon$–$\\delta$ definition

We write $\\lim_{x \\to a} f(x) = L$ to mean:

> For every $\\varepsilon > 0$ there exists a $\\delta > 0$ such that whenever $0 < |x - a| < \\delta$, we have $|f(x) - L| < \\varepsilon$.

In symbols:

$$\\forall \\varepsilon > 0,\\ \\exists \\delta > 0 : 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon.$$

This formulation is due to Cauchy (1821) and refined by Weierstrass in the 1850s. It says: no matter how tight a window $\\varepsilon$ you demand on the output, I can find a tight enough window $\\delta$ on the input that guarantees it. Nothing in this definition mentions "infinity" or "infinitesimal." That is the entire point.

## What the definition replaced

Newton and Leibniz, inventing calculus in the 1670s, spoke of *fluxions* and *infinitesimals* — quantities smaller than any positive number but not zero. Bishop Berkeley (1734) mocked them as "the ghosts of departed quantities," and he was right that the foundations were incoherent. Two centuries later, the $\\varepsilon$–$\\delta$ definition gave calculus the rigorous foundation it had been doing without. (Robinson, 1960, vindicated the infinitesimal approach with *nonstandard analysis* — but the $\\varepsilon$–$\\delta$ definition is still the working language.)

## Limits at infinity

$$\\lim_{x \\to \\infty} f(x) = L \\iff \\forall \\varepsilon > 0,\\ \\exists M : x > M \\Rightarrow |f(x) - L| < \\varepsilon.$$

Same idea: the "tight window on the output" is met by a "far enough out on the input."

## A scientific example

The terminal velocity of a falling skydiver is a limit:

$$v_{\\text{term}} = \\lim_{t \\to \\infty} v(t).$$

The skydiver never *reaches* terminal velocity — at any finite $t$, $v(t)$ is strictly less. But the difference gets arbitrarily small as time goes on. The limit captures this precisely without committing to "infinity" as a number.`,
  },
  {
    slug: "continuity",
    title: "Continuity",
    weekNumber: 3,
    blurb: "A function is continuous when small input changes give small output changes.",
    lectureTitle: "3.2 Continuity",
    body: `# Continuity

A function $f : \\mathbb{R} \\to \\mathbb{R}$ is **continuous at $a$** if

$$\\lim_{x \\to a} f(x) = f(a).$$

Three things have to be true simultaneously: $f(a)$ has to exist, the limit has to exist, and they have to be equal. $f$ is **continuous** if it is continuous at every $a$ in its domain.

In plain English: nearby inputs go to nearby outputs. You can draw the graph without lifting your pen. (The plain-English version misses some pathological continuous functions, but it captures the spirit.)

## Discontinuities

There are three flavors of failure:

- **Removable.** $\\lim_{x \\to a} f(x)$ exists but isn't $f(a)$. Redefine $f(a)$ and you've fixed it.
- **Jump.** Left and right limits exist but differ. A step function. Common in physics (phase transitions) and economics (tax brackets).
- **Essential.** The limit doesn't exist at all. $\\sin(1/x)$ near $0$ oscillates forever.

## The Intermediate Value Theorem

If $f$ is continuous on $[a, b]$ and $y_0$ is any value between $f(a)$ and $f(b)$, then there is some $c \\in [a, b]$ with $f(c) = y_0$.

This is one of those theorems that feels like a definition: of *course* a continuous curve from $f(a)$ to $f(b)$ has to cross every height between them. But you cannot prove it without the completeness of $\\mathbb{R}$ (lecture 1.4) — the IVT is false on $\\mathbb{Q}$ alone.

## The Extreme Value Theorem

If $f$ is continuous on a closed bounded interval $[a, b]$, then $f$ attains a maximum and a minimum on $[a, b]$.

This too fails without compactness: $f(x) = 1/x$ on $(0, 1]$ is continuous but unbounded.

## A scientific example

Temperature is a continuous function of position on Earth. By the IVT (applied on a great circle), at every moment there exist two *antipodal* points on the equator that have the exact same temperature. This is a special case of the **Borsuk–Ulam theorem**, which generalizes to any continuous map from a sphere to a Euclidean space of lower dimension.`,
  },
  {
    slug: "derivatives-instantaneous-rate",
    title: "Derivatives as instantaneous rate",
    weekNumber: 3,
    blurb: "What's the speed *right now*? — the question that started calculus.",
    lectureTitle: "3.3 Derivatives as instantaneous rate",
    body: `# Derivatives as instantaneous rate

The average rate of change of $f$ over an interval $[a, a + h]$ is

$$\\frac{f(a + h) - f(a)}{h}.$$

The **derivative** of $f$ at $a$ is what this approaches as the interval shrinks:

$$f'(a) = \\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h},$$

when the limit exists. Geometrically, $f'(a)$ is the *slope of the tangent line* to the graph of $f$ at $x = a$.

## Three pictures

- **Geometric.** Slope of the tangent line.
- **Physical.** Instantaneous rate of change. Velocity is the derivative of position; acceleration is the derivative of velocity.
- **Numerical.** The best linear approximation: near $a$, $f(x) \\approx f(a) + f'(a)(x - a)$.

All three are the same idea, stated in three languages.

## Notation

- Lagrange: $f'(x)$.
- Leibniz: $\\dfrac{\\mathrm{d}f}{\\mathrm{d}x}$. Treats the derivative as a ratio of "differentials" — heuristic, but extremely useful for change-of-variable.
- Newton: $\\dot f$. Mostly survives in physics, for derivatives with respect to time.
- Operator: $D f$ or $\\partial_x f$.

Same object, four notations. Each makes a different calculation natural.

## Differentiable implies continuous

If $f$ is differentiable at $a$, it is continuous at $a$. (Proof sketch: $f(a + h) - f(a) = h \\cdot \\dfrac{f(a+h)-f(a)}{h} \\to 0 \\cdot f'(a) = 0$ as $h \\to 0$.) The converse fails: $f(x) = |x|$ is continuous everywhere but not differentiable at $0$.

In fact, Weierstrass (1872) constructed a function that is continuous everywhere and differentiable *nowhere* — a curve that is unbroken but has no tangent line at any point. The intuition that "continuous = smooth" is a useful lie.

## A scientific example

Newton's second law in its most general form is

$$\\vec F = \\frac{\\mathrm{d}\\vec p}{\\mathrm{d}t},$$

force equals the time-derivative of momentum. Reducing the universe of mechanics to a single derivative — that is what calculus is *for*.`,
  },
  {
    slug: "integrals-accumulation",
    title: "Integrals as accumulation",
    weekNumber: 3,
    blurb: "Summing infinitely many infinitesimal pieces.",
    lectureTitle: "3.4 Integrals as accumulation",
    body: `# Integrals as accumulation

If the derivative answers "how fast is it changing?", the **integral** answers "how much has accumulated?".

## The Riemann integral

Partition $[a, b]$ into $n$ pieces by points $a = x_0 < x_1 < \\cdots < x_n = b$. Pick a sample point $x_i^*$ in each subinterval $[x_{i-1}, x_i]$. Form the **Riemann sum**

$$S_n = \\sum_{i=1}^{n} f(x_i^*) \\, (x_i - x_{i-1}).$$

Each term is a rectangle: width times height. Their sum approximates the area under $f$ over $[a,b]$.

The **definite integral** is the limit of these sums as the partition is refined:

$$\\int_a^b f(x)\\,\\mathrm{d}x = \\lim_{\\|P\\| \\to 0} \\sum_{i=1}^{n} f(x_i^*)(x_i - x_{i-1}),$$

where $\\|P\\|$ is the width of the widest subinterval, and provided the limit exists independent of choices.

## What integrals compute

- **Area** under a curve, when $f \\ge 0$.
- **Signed area** in general (positive above the axis, negative below).
- **Accumulated total** of any rate: $\\int_a^b v(t)\\,\\mathrm{d}t$ is the displacement over $[a, b]$ if $v$ is velocity.
- **Average value** of $f$ on $[a, b]$: $\\dfrac{1}{b - a}\\int_a^b f(x)\\,\\mathrm{d}x$.
- **Probability**: the probability that a continuous random variable $X$ with density $p$ lies in $[a, b]$ is $\\int_a^b p(x)\\,\\mathrm{d}x$.

## Why "$\\mathrm{d}x$"

The "$\\mathrm{d}x$" is the limiting width of a rectangle. It is the same $\\mathrm{d}x$ that appears in Leibniz's derivative notation $\\mathrm{d}f/\\mathrm{d}x$, and the symmetry is the subject of the next lecture.

## A historical example

Archimedes computed the area of a parabolic segment, around 250 BCE, using essentially Riemann sums two millennia before Riemann. He bounded the area between inscribed and circumscribed triangles, refined the partition, and showed the bounds squeeze to the same value. Calculus existed in spirit long before its symbols did.`,
  },
  {
    slug: "ftc",
    title: "The Fundamental Theorem of Calculus",
    weekNumber: 3,
    blurb: "Differentiation and integration undo each other.",
    lectureTitle: "3.5 The Fundamental Theorem of Calculus",
    body: `# The Fundamental Theorem of Calculus

Derivatives measure instantaneous change. Integrals accumulate change. The **Fundamental Theorem** says these are inverse operations.

## Part 1: derivative of an integral

Let $f$ be continuous on $[a, b]$, and define $F : [a, b] \\to \\mathbb{R}$ by

$$F(x) = \\int_a^x f(t)\\,\\mathrm{d}t.$$

Then $F$ is differentiable and $F'(x) = f(x)$.

So integration *produces* an antiderivative: $F$ is a function whose derivative is $f$.

## Part 2: integral of a derivative

If $F$ is any antiderivative of $f$ on $[a, b]$ (i.e. $F' = f$ and $F$ is continuous on $[a, b]$), then

$$\\int_a^b f(x)\\,\\mathrm{d}x = F(b) - F(a).$$

This is the calculation rule: to integrate $f$, find any antiderivative $F$, and subtract.

## Why this is "fundamental"

Differentiation is a *local* operation: $f'(a)$ depends only on $f$ near $a$. Integration is a *global* operation: $\\int_a^b f$ depends on $f$ everywhere on $[a, b]$. There is no a priori reason these two operations should be related, much less inverse.

The FTC is the bridge. It says: to compute the global thing (the integral), you can solve a local problem (find an antiderivative) and read off two values. Every closed-form integral you have ever computed is an application of the FTC.

## A historical note

Newton and Leibniz are usually credited with calculus because they were the first to recognize and exploit the FTC. Earlier mathematicians (Cavalieri, Fermat, Barrow) had pieces of the differentiation and integration theory but treated them as separate subjects. The unification was the conceptual leap.

## A scientific example

In thermodynamics, the change in internal energy of a closed system over a process is

$$\\Delta U = \\int_{t_1}^{t_2} \\frac{\\mathrm{d}U}{\\mathrm{d}t}\\,\\mathrm{d}t = U(t_2) - U(t_1).$$

We almost never know $\\mathrm{d}U/\\mathrm{d}t$ as a function we could integrate term by term. The point of having the FTC is that the *value* $\\Delta U$ depends only on the initial and final states, never on the path — energy is a *state function*. Every conservation law in physics is, formally, a statement that some integrand is the derivative of something.`,
  },
  {
    slug: "sequences-series-zeno",
    title: "Sequences, series, and Zeno",
    weekNumber: 3,
    blurb: "An infinite sum can have a finite value.",
    lectureTitle: "3.6 Sequences, series, and Zeno",
    body: `# Sequences, series, and Zeno

A **sequence** is a function $\\mathbb{N} \\to \\mathbb{R}$, usually written $(a_n)_{n \\ge 1}$. A **series** is the formal sum

$$\\sum_{n=1}^{\\infty} a_n = a_1 + a_2 + a_3 + \\cdots$$

## What an infinite sum *means*

You cannot add infinitely many numbers in finite time. So the value of an infinite series is defined as the limit of its **partial sums**:

$$\\sum_{n=1}^{\\infty} a_n := \\lim_{N \\to \\infty} \\sum_{n=1}^{N} a_n,$$

if the limit exists. If it does, the series **converges**; otherwise it **diverges**.

## Zeno's paradox

Achilles races a tortoise that starts $10$ meters ahead. Zeno (5th c. BCE) argued Achilles can never overtake it: first he has to cover the $10$ meters, then the new gap, then the new new gap, and so on — infinitely many steps in finite time, which Zeno called absurd.

We now see the argument for what it is: the steps form a **geometric series**

$$10 + 10 \\cdot r + 10 \\cdot r^2 + \\cdots = \\frac{10}{1 - r}$$

which is *finite* whenever $|r| < 1$. Zeno's mistake was assuming infinitely many steps must take infinite time. They don't.

## Convergence tests

A short menu of standard tools:

- **Geometric**: $\\sum r^n$ converges iff $|r| < 1$.
- **$p$-series**: $\\sum 1/n^p$ converges iff $p > 1$.
- **Ratio test**: if $\\lim |a_{n+1}/a_n| < 1$, the series converges absolutely.
- **Comparison test**: if $|a_n| \\le b_n$ and $\\sum b_n$ converges, so does $\\sum a_n$.

## Power series

A **power series** is $\\sum c_n (x - a)^n$. Its **radius of convergence** is the largest $R$ such that the series converges for $|x - a| < R$. Inside its radius, a power series defines an infinitely differentiable function — its **analytic** representative. The functions $e^x = \\sum x^n / n!$, $\\sin x = \\sum (-1)^n x^{2n+1}/(2n+1)!$, and $\\cos x$ are all power series convergent for all $x$.

## A scientific example

Quantum field theory's predictions are computed as **perturbation series** in a small coupling constant. The series for the electron's anomalous magnetic moment, computed to high order, matches experiment to twelve decimal places — one of the most precise agreements between theory and measurement in all of science. (Notoriously, these series usually do not converge; they are *asymptotic*. The first few terms approximate the right answer, but adding more terms eventually makes things worse. Which is a story for an analysis course.)`,
  },
  {
    slug: "euclidean-non-euclidean",
    title: "Euclidean vs. non-Euclidean geometry",
    weekNumber: 3,
    blurb: "Euclid's fifth postulate is independent — and false on a sphere.",
    lectureTitle: "3.7 Euclidean vs. non-Euclidean geometry",
    body: `# Euclidean vs. non-Euclidean geometry

Euclid's *Elements* (c. 300 BCE) developed plane geometry from five postulates. Four are uncontroversially "obvious." The fifth is not.

## The parallel postulate

> Through a point not on a given line, there is exactly one line parallel to the given line.

For two millennia, mathematicians tried to *prove* this from the other four — believing it should be a theorem, not a postulate. Every attempt failed.

## The resolution

In the early 19th century, Lobachevsky (1829), Bolyai (1832), and Gauss (unpublished) independently realized why every attempt had failed: the parallel postulate is **independent** of the others. You can replace it with its negation and get a consistent geometry.

Three possibilities:

- **Exactly one parallel** — Euclidean geometry, $\\mathbb{R}^2$.
- **No parallels** — elliptic / spherical geometry. On a sphere, every two great circles intersect.
- **Infinitely many parallels** — hyperbolic geometry. Through a point off a line, infinitely many lines never meet the given line.

Each of these is a logically consistent geometry. The angles of a triangle sum to $180°$ in Euclidean, more than $180°$ in elliptic, and less than $180°$ in hyperbolic.

## Why this mattered

The discovery of non-Euclidean geometry was a philosophical earthquake. It demonstrated, for the first time, that mathematics is not the description of a single "true" world but the systematic study of consequences of chosen axioms (a theme we will return to in 4.5).

## A scientific example

General relativity (Einstein, 1915) models spacetime as a *curved* manifold whose geometry is determined by the matter and energy inside it. Light rays follow **geodesics** — the analogues of straight lines — and those geodesics bend through gravitational fields. The first experimental confirmation was Eddington's 1919 measurement of starlight bending around the Sun during a solar eclipse. The universe is not Euclidean. The geometry of spacetime is fixed not by axiom but by Einstein's field equations:

$$R_{\\mu\\nu} - \\tfrac{1}{2} g_{\\mu\\nu} R = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}.$$`,
  },
  {
    slug: "topology-dimension-curvature",
    title: "Topology, dimension, and curvature",
    weekNumber: 3,
    blurb: "Geometry without distance: what survives when you stretch the page.",
    lectureTitle: "3.8 Topology, dimension, and curvature",
    body: `# Topology, dimension, and curvature

**Topology** is the study of geometric properties that are preserved under continuous deformations — stretching, bending, twisting, but not tearing or gluing. The classic joke is that a topologist cannot tell a coffee mug from a donut, because each can be continuously deformed into the other.

## What topology keeps and discards

- **Discarded:** distance, angle, area, volume, curvature.
- **Kept:** number of connected pieces, number of holes, orientability, the way the space loops back on itself.

A circle and a square are topologically the same (both are simple closed loops). A line segment and a Y-shape are different: removing one point disconnects them differently.

## Dimension

Topology lets us say what the **dimension** of a space *is*, independent of any coordinate system.

- Informally: a space is $n$-dimensional if it locally looks like $\\mathbb{R}^n$.
- A line is $1$-dimensional; the plane is $2$-dimensional; the surface of a sphere is $2$-dimensional (yes, the surface — you can describe any point on it with latitude and longitude).
- The Cantor set has dimension $\\log 2 / \\log 3 \\approx 0.63$ in the fractal (Hausdorff) sense — a single number need not be an integer to make sense as a dimension.

## Curvature

Once you put a *metric* (a notion of distance) back on a topological space, you can ask whether it is **curved**. Gauss (1827) showed that curvature is *intrinsic*: an ant living on a surface can detect curvature without ever leaving the surface, by measuring how the angles of triangles sum.

- A plane has curvature $0$. Triangle angle sums equal $\\pi$.
- A sphere of radius $R$ has constant positive curvature $1/R^2$. Triangle angle sums exceed $\\pi$.
- A saddle / pseudosphere has negative curvature. Triangle angle sums fall below $\\pi$.

## The Euler characteristic

For a polyhedron with $V$ vertices, $E$ edges, and $F$ faces,

$$\\chi = V - E + F.$$

For *every* triangulation of a sphere, $\\chi = 2$. For *every* triangulation of a torus, $\\chi = 0$. The Euler characteristic is a topological invariant: it depends on the surface, not on how you cut it up.

## A scientific example

The shape of the *universe* — its global topology — is an open question in cosmology. Locally it appears flat (zero curvature). Globally it could be an infinite plane, a finite 3-torus, a 3-sphere, or any number of more exotic possibilities. Distinguishing these requires looking for repeated patterns in the cosmic microwave background — circles in the sky that would be "the same place seen twice." So far none have been found, but the constraints continue to tighten.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 4 — Foundations: logic, proof, set theory, undecidability
  // ───────────────────────────────────────────────────────────────
  {
    slug: "propositional-predicate-logic",
    title: "Propositional and predicate logic",
    weekNumber: 4,
    blurb: "Truth values, connectives, quantifiers: the grammar of proof.",
    lectureTitle: "4.1 Propositional and predicate logic",
    body: `# Propositional and predicate logic

Mathematics is built out of *statements* — sentences that are either true or false — combined according to a fixed grammar. **Logic** is the study of that grammar.

## Propositional logic

A **proposition** is a declarative sentence with a truth value. We build complex propositions out of simple ones using five **connectives**:

- $\\neg P$ — not $P$.
- $P \\wedge Q$ — $P$ and $Q$.
- $P \\vee Q$ — $P$ or $Q$ (inclusive — at least one).
- $P \\to Q$ — if $P$ then $Q$ (implication).
- $P \\leftrightarrow Q$ — $P$ if and only if $Q$ (biconditional).

Each connective is fully described by a truth table. Implication is the trickiest: $P \\to Q$ is false only when $P$ is true and $Q$ is false. In particular, "if $0 = 1$, then I am the Pope" is true — from a false premise, anything follows ($ex\\ falso\\ quodlibet$).

A **tautology** is a propositional formula that is true under every truth assignment, e.g. $P \\vee \\neg P$ (the law of excluded middle).

## Predicate logic

Propositional logic cannot say "every integer has a successor." For that we need **predicates** $P(x)$ — statements about a variable — and **quantifiers**:

- $\\forall x \\, P(x)$ — *for all* $x$, $P(x)$.
- $\\exists x \\, P(x)$ — *there exists* $x$ such that $P(x)$.

Predicate logic is strictly more powerful. The Pythagorean theorem, "for every right triangle with legs $a$, $b$ and hypotenuse $c$, $a^2 + b^2 = c^2$," is genuinely a $\\forall$ statement and cannot be captured in propositional logic alone.

## Negation of quantifiers

These are easy to get wrong:

$$\\neg(\\forall x \\, P(x)) \\equiv \\exists x \\, \\neg P(x),$$
$$\\neg(\\exists x \\, P(x)) \\equiv \\forall x \\, \\neg P(x).$$

The negation of "every swan is white" is "some swan is not white" — not "no swan is white."

## A scientific example

The $\\varepsilon$–$\\delta$ definition of a limit (3.1) is the canonical example of a nested-quantifier statement: $\\forall \\varepsilon, \\exists \\delta, \\forall x, \\ldots$. Reversing the order of the quantifiers — $\\exists \\delta, \\forall \\varepsilon$ — produces a strictly *stronger* condition (uniform continuity). Quantifier order *is* the mathematics.`,
  },
  {
    slug: "what-is-proof",
    title: "What a proof is",
    weekNumber: 4,
    blurb: "A proof is a finite chain of inferences from accepted premises.",
    lectureTitle: "4.2 What a proof is",
    body: `# What a proof is

A **proof** of a statement $S$, in a given axiomatic system, is a finite sequence of statements ending in $S$, where each statement is either:

1. an axiom (a premise accepted without proof),
2. a previously proven theorem, or
3. a consequence of earlier statements in the sequence by an explicit rule of inference (e.g. modus ponens: from $P$ and $P \\to Q$, conclude $Q$).

This is what proof *is*, formally. In practice, mathematicians write proofs in natural language that compresses many such steps into one — but the underlying object is always, in principle, a finite chain like the above.

## Common proof techniques

- **Direct proof.** To prove $P \\to Q$: assume $P$, derive $Q$.
- **Proof by contradiction.** To prove $S$: assume $\\neg S$, derive a contradiction. (Used in 1.3 for $\\sqrt 2 \\notin \\mathbb{Q}$.)
- **Proof by contrapositive.** To prove $P \\to Q$: prove $\\neg Q \\to \\neg P$ instead. Logically equivalent.
- **Proof by cases.** To prove $S$ given that exactly one of $C_1, \\ldots, C_n$ must hold: prove $S$ assuming each $C_i$ in turn.
- **Proof by induction.** See 4.3.
- **Constructive proof.** Prove $\\exists x \\, P(x)$ by exhibiting a specific $x$.
- **Nonconstructive proof.** Prove $\\exists x \\, P(x)$ without producing one. (Classic: there exist irrational $a, b$ with $a^b$ rational. Proof: consider $\\sqrt 2 ^{\\sqrt 2}$. If rational, done. If irrational, then $(\\sqrt 2 ^{\\sqrt 2})^{\\sqrt 2} = 2$ is rational, done. We don't know which case applied.)

## What a proof is *not*

A proof is not a description, a strong argument, an accumulation of examples, or a check that the result agrees with computation. "I've tried it for the first ten million $n$ and it works" is not a proof. (Famous example: the conjecture that $\\sum_{k=2}^n 1/(k \\ln k) > \\ln \\ln n$ for all $n \\ge 2$ holds for *every* $n$ ever checked but is now known to fail somewhere around $n \\approx 1.4 \\times 10^{316}$ — a number too large to ever check by computer.)

## Why proof matters

Proof is the *currency* of mathematics. It is what separates mathematics from every other field: a result is part of the body of mathematics if and only if it has been proven from the axioms. Outside mathematics, "proof" is rhetoric. Inside mathematics, it is a precisely defined object.`,
  },
  {
    slug: "mathematical-induction",
    title: "Mathematical induction",
    weekNumber: 4,
    blurb: "Prove a statement for all natural numbers from a base and a step.",
    lectureTitle: "4.3 Mathematical induction",
    body: `# Mathematical induction

**Mathematical induction** is the proof technique tailored to statements of the form "for every natural number $n$, $P(n)$ holds."

## The principle

To prove $\\forall n \\in \\mathbb{N}\\, P(n)$:

1. **Base case.** Prove $P(0)$ (or $P(1)$, depending on where $\\mathbb{N}$ starts).
2. **Inductive step.** Prove that $P(k) \\Rightarrow P(k+1)$ for every $k$.

If both succeed, $P(n)$ holds for all $n$. The metaphor is dominoes: knock the first one down (base), arrange each one so it knocks the next (step), and they all fall.

## Why it works

Induction is *equivalent* to the **well-ordering principle**: every nonempty subset of $\\mathbb{N}$ has a least element. Suppose induction failed for some $P$. Then $\\{n : \\neg P(n)\\}$ is a nonempty subset of $\\mathbb{N}$; let $m$ be its least element. We know $m > 0$ (since the base case holds), so $m - 1 \\in \\mathbb{N}$ and $P(m - 1)$ holds. But then by the inductive step $P(m)$ holds — contradiction.

So induction is not a separate axiom: it is a consequence of how $\\mathbb{N}$ is ordered. Conversely, the **Peano axioms** for $\\mathbb{N}$ take induction as one of the foundational axioms.

## A worked example

**Claim.** $1 + 2 + 3 + \\cdots + n = \\dfrac{n(n+1)}{2}$ for all $n \\ge 1$.

*Base.* For $n = 1$: LHS $= 1$, RHS $= 1 \\cdot 2 / 2 = 1$. ✓

*Step.* Assume the formula for $n = k$:

$$1 + 2 + \\cdots + k = \\frac{k(k+1)}{2}.$$

Add $k + 1$ to both sides:

$$1 + 2 + \\cdots + k + (k+1) = \\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}.$$

That's the formula at $n = k+1$. ✓ ∎

## Strong induction

A useful variant: assume $P(0), P(1), \\ldots, P(k)$ all hold and prove $P(k+1)$. Logically equivalent to ordinary induction, but more convenient when the proof needs more than the immediate predecessor — e.g. proving that every integer $\\ge 2$ has a prime factorization.

## A scientific example

The proof that a binary heap of $n$ elements supports *extract-min* in $O(\\log n)$ time goes by induction on the height of the heap. Almost every correctness proof in computer science is, under the hood, an induction over the size or structure of the input.`,
  },
  {
    slug: "sets-russell-paradox",
    title: "Sets and Russell's paradox",
    weekNumber: 4,
    blurb: "The naive notion of a set is inconsistent.",
    lectureTitle: "4.4 Sets and Russell's paradox",
    body: `# Sets and Russell's paradox

Set theory is the lingua franca of modern mathematics: every object we have studied — numbers, functions, groups, vector spaces — can be encoded as a set. So you might expect the foundations of set theory to be straightforward. They are not.

## Naive set theory

Cantor and Frege, in the late 1800s, took as a basic principle:

> **Unrestricted comprehension.** For every property $P$, there is a set $\\{x : P(x)\\}$ of all things satisfying $P$.

This is the "naive" picture: a set is any collection you can describe. It seems obviously true. It is also inconsistent.

## Russell's paradox (1901)

Define

$$R = \\{x : x \\notin x\\},$$

the set of all sets that are not members of themselves. (Most familiar sets satisfy this: $\\mathbb{N}$ is not an element of $\\mathbb{N}$.) Now ask: is $R \\in R$?

- If $R \\in R$, then by definition of $R$, $R \\notin R$. Contradiction.
- If $R \\notin R$, then $R$ satisfies the defining property, so $R \\in R$. Contradiction.

Either way, contradiction. Therefore $R$ cannot be a set. Therefore unrestricted comprehension is false. Therefore naive set theory is inconsistent.

Russell sent this to Frege in 1902, just as Frege's life work on the foundations of arithmetic was going to press. Frege added an appendix to the second volume acknowledging that the work was now on broken ground.

## The fix: axiomatic set theory

Modern set theory (Zermelo 1908, Fraenkel 1922) replaces unrestricted comprehension with weaker, carefully chosen axioms:

- **Extensionality.** Two sets are equal iff they have the same elements.
- **Pairing.** For any $a, b$, $\\{a, b\\}$ is a set.
- **Union, power set, infinity, replacement, regularity, …**
- **Restricted comprehension.** From a *given* set $A$ and a property $P$, you can form $\\{x \\in A : P(x)\\}$.

The crucial change: you can only filter elements out of an existing set; you cannot conjure a set from a property alone. This blocks Russell's construction.

This system, with the axiom of choice added, is **ZFC** — the standard foundation of mathematics today. (Almost) every theorem you know is, in principle, derivable from ZFC.

## The lesson

Mathematics is not self-evidently consistent. Even our most basic intuitions about "collection" can lead to contradiction. Foundations are not optional plumbing; they are a thing you can get wrong.`,
  },
  {
    slug: "axioms-independence",
    title: "Axioms and independence results",
    weekNumber: 4,
    blurb: "Some questions cannot be answered by the axioms we have.",
    lectureTitle: "4.5 Axioms and independence results",
    body: `# Axioms and independence results

A statement $S$ is **independent** of an axiom system $T$ if neither $S$ nor $\\neg S$ can be proven from $T$. Independence is a fact about a *system*, not about the truth of $S$.

## The parallel postulate, again

We met the first major independence result in 3.7: Euclid's fifth postulate is independent of the other four. You can adopt it (Euclidean geometry), negate it one way (elliptic geometry), or negate it the other way (hyperbolic geometry), and each choice yields a consistent system. There is no "right answer" inside the axioms.

How was independence proven? By **models**. Exhibit a model of geometry in which the other four postulates hold and the fifth fails. The Poincaré disc model of the hyperbolic plane does exactly this — and its consistency is reduced to the consistency of Euclidean geometry, which is reduced to the consistency of $\\mathbb{R}$, which is reduced to ZFC.

## The Continuum Hypothesis

In 1878 Cantor asked: are there any cardinalities strictly between $|\\mathbb{N}|$ and $|\\mathbb{R}|$? The **Continuum Hypothesis (CH)** says no:

$$\\text{CH:}\\quad |\\mathbb{R}| = \\aleph_1.$$

Cantor and others tried for decades to prove CH from set theory. The resolution came in two stages:

- **Gödel (1940).** CH is *consistent* with ZFC. If ZFC is consistent, so is ZFC + CH.
- **Cohen (1963).** $\\neg$CH is also *consistent* with ZFC. If ZFC is consistent, so is ZFC + $\\neg$CH.

Together: CH is **independent** of ZFC. There is no proof in either direction. (Cohen invented the technique of *forcing* to do this, the deepest tool in set theory.)

This is unsettling. CH looks like a definite mathematical question — does some specific cardinality exist or not? — and the axioms we use for all of mathematics cannot answer it. There are at least three reactions:

1. **Platonism.** CH has a definite truth value; our axioms are incomplete. We should look for new, well-motivated axioms that decide it.
2. **Formalism.** CH has no truth value independent of an axiom system. Math is the study of consequences of axiom systems; pick one and proceed.
3. **Multiverse view (Hamkins).** There are many "universes of sets," some satisfying CH, some not, all equally legitimate.

## The Axiom of Choice

A similar story: the **Axiom of Choice** (AC) says that, given any family of nonempty sets, you can pick one element from each. Innocuous-sounding, but it implies the **Banach–Tarski paradox**: a solid ball can be decomposed into five pieces and reassembled into two solid balls of the same size. (The pieces are non-measurable.) AC is independent of ZF (ZFC minus choice), and ZFC routinely takes AC on board.

## The deeper point

The discovery of independence results dissolved the dream — already in trouble after Russell's paradox — that mathematics is a single, finished, complete body of truth. It is, instead, the study of *what follows from what*. The axioms are the starting point you chose; the theorems are what you got. Different starting points are different mathematics.`,
  },
  {
    slug: "godel-incompleteness",
    title: "Gödel's incompleteness theorems",
    weekNumber: 4,
    blurb: "Any sufficient axiom system contains true statements it cannot prove.",
    lectureTitle: "4.6 Gödel's incompleteness theorems",
    body: `# Gödel's incompleteness theorems

In 1931, Kurt Gödel — age 25 — published two theorems that ended the century-old dream of finding a complete, consistent axiomatization of mathematics.

## What the theorems say

Let $T$ be a formal axiom system rich enough to encode basic arithmetic (Peano arithmetic suffices, as does ZFC). Assume $T$ is **consistent** (proves no contradiction) and *effective* (its axioms can be recognized by an algorithm).

- **First incompleteness theorem.** There is a statement $G$ in the language of $T$ that is *true* (in the standard model) but *not provable* in $T$. Moreover, $\\neg G$ is also not provable. $T$ is **incomplete**.
- **Second incompleteness theorem.** The statement "$T$ is consistent" is not provable in $T$ itself.

In a sentence: any system strong enough to do arithmetic is either inconsistent or unable to prove its own consistency, and is always missing some truths.

## The construction (sketch)

Gödel's proof works by *self-reference*. He showed how to encode statements about $T$'s proofs as statements about numbers (this is **Gödel numbering**). Inside arithmetic, you can then formulate a sentence $G$ that says, in effect:

> "This sentence is not provable in $T$."

Now: if $T$ proves $G$, then $G$ is false — but $T$ proves only true things (by consistency). Contradiction. So $T$ does not prove $G$. But that is exactly what $G$ asserts. So $G$ is true. And $T$ does not prove it.

The self-reference is the same machinery that powers the liar paradox ("this sentence is false") — but Gödel rebuilt it inside arithmetic, where it cannot be waved away as a quirk of natural language.

## What it does **not** say

The theorems are routinely misquoted. They do not say:

- "Mathematics is inconsistent." (No — they assume consistency.)
- "Some mathematical questions have no answer." (Only relative to a given axiom system.)
- "Machines can never match human reasoning." (A philosophical extrapolation, not a theorem.)
- "Anything goes." (No — proofs from the axioms are still proofs from the axioms.)

What the theorems *do* say is sharp and limited: any single effective axiom system $T$ for arithmetic has true statements outside it. You can always extend $T$ to a larger system $T'$ that proves $G_T$ — but then $T'$ has its own unprovable $G_{T'}$. You never finish.

## The historical impact

Hilbert's program (1920s) was an explicit plan to formalize *all* of mathematics in a single system and prove it complete and consistent from within. The second incompleteness theorem killed the consistency half outright. The first killed the completeness half. The program was over within a year.

What replaced it is the *modern* understanding of mathematics: as a network of axiom systems, each studied for its own consequences, with relationships between systems (relative consistency, conservative extension, mutual interpretability) doing the work that a single foundational system was supposed to do.`,
  },
  {
    slug: "probability-foundations",
    title: "Probability: measure, frequency, credence",
    weekNumber: 4,
    blurb: "What does it *mean* to say a probability is $0.7$?",
    lectureTitle: "4.7 Probability: measure, frequency, credence",
    body: `# Probability: measure, frequency, credence

We use the word *probability* for at least three different things. Modern mathematics has a precise definition of one of them and leaves the others to philosophy.

## The mathematical definition (Kolmogorov, 1933)

A **probability space** is a triple $(\\Omega, \\mathcal{F}, P)$ where:

- $\\Omega$ is a set of **outcomes** (the *sample space*).
- $\\mathcal{F}$ is a collection of subsets of $\\Omega$ called **events**, closed under complement and countable unions (a *$\\sigma$-algebra*).
- $P : \\mathcal{F} \\to [0, 1]$ is a function satisfying:
  1. $P(\\Omega) = 1$,
  2. $P(\\emptyset) = 0$,
  3. *Countable additivity:* for any disjoint sequence $A_1, A_2, \\ldots \\in \\mathcal{F}$,
     $$P\\!\\left(\\bigcup_n A_n\\right) = \\sum_n P(A_n).$$

That is *all* probability theory says probability *is*: a normalized measure on a $\\sigma$-algebra. Every theorem (law of large numbers, central limit theorem, Bayes' rule) is a consequence.

This is a beautifully clean foundation. But it leaves an enormous question unanswered: *how do you choose $P$ in a real problem?*

## The three interpretations

- **Frequentist.** $P(A)$ is the long-run relative frequency of $A$ in independent repeated trials. "The probability this coin lands heads is $0.5$" means: if you toss it forever, the fraction of heads tends to $0.5$. Concept of probability for one-off events is undefined.
- **Bayesian / subjective.** $P(A)$ is your **degree of belief** that $A$ is true, calibrated so that you would accept fair bets at those odds. New evidence updates your beliefs by Bayes' rule. Applies to one-off events ("the probability it rains tomorrow") and to hypotheses ("the probability the coin is fair").
- **Propensity.** $P(A)$ is a real, physical disposition of the system — a tendency. Useful for talking about quantum mechanics, where the probabilities seem to be features of the world rather than features of our ignorance.

All three interpretations satisfy Kolmogorov's axioms. The math is the same; the *meaning* is contested.

## A scientific example

When a clinical trial reports "the drug reduces mortality by $40\\%$ ($p = 0.03$)," the $p$-value is a frequentist statement: under the null hypothesis (drug has no effect), the probability of seeing data this extreme or more is $0.03$. This is *not* the probability that the null hypothesis is false — that would be a Bayesian statement, requiring a prior. The widespread confusion of these two statements is responsible for a substantial fraction of misreported science. The math doesn't care which interpretation you adopt; the *conclusion you can draw* depends on it absolutely.`,
  },
  {
    slug: "computability-halting",
    title: "Computability and the halting problem",
    weekNumber: 4,
    blurb: "There is no algorithm that decides whether an algorithm halts.",
    lectureTitle: "4.8 Computability and the halting problem",
    body: `# Computability and the halting problem

To finish the course, we ask: what can be computed, in principle, by any mechanical procedure?

## Turing machines

Alan Turing (1936) formalized an *idealized computer*: a finite state controller reading and writing symbols on an unbounded tape, according to a finite table of rules. A **Turing machine** is fully specified by that table.

The **Church–Turing thesis** says: every function that is computable, by any mechanical procedure whatsoever — pencil and paper, modern computer, abacus, biological cell — is computable by some Turing machine. This is a thesis, not a theorem, because "mechanical procedure" has no a priori mathematical definition. But every alternative model of computation people have invented (lambda calculus, recursive functions, register machines, modern CPUs) turns out to compute exactly the same class of functions. The Turing-computable functions are, empirically, *the* computable functions.

## The halting problem

A natural question: given a Turing machine $M$ and an input $x$, does $M$ eventually halt, or does it run forever?

Turing's headline result: **no algorithm can decide this in general.** The **halting problem** is *undecidable*.

## The proof

Suppose, for contradiction, there is a Turing machine $H$ that, given $\\langle M, x \\rangle$, outputs "yes" if $M(x)$ halts and "no" otherwise. Build a new machine $D$ that, given an input $\\langle M \\rangle$ (the description of a machine), runs $H$ on $\\langle M, M \\rangle$ and then:

- if $H$ says "yes" (i.e. $M$ halts on input $M$), $D$ loops forever;
- if $H$ says "no," $D$ halts.

Now ask: what does $D$ do on input $\\langle D \\rangle$?

- If $D$ halts on $\\langle D \\rangle$, then by construction $H$ said "yes" — which means $D$ does not halt on $\\langle D \\rangle$. Contradiction.
- If $D$ does not halt, then $H$ said "no" — which means $D$ does halt on $\\langle D \\rangle$. Contradiction.

Either way, contradiction. Therefore no such $H$ exists. The halting problem is uncomputable. ∎

This argument is the *exact same* diagonal trick that Cantor used to prove $\\mathbb{R}$ uncountable (1.8) and that Gödel used in the incompleteness theorem (4.6). The three results — uncountability, incompleteness, undecidability — are siblings of one self-referential move.

## What follows

Once you have one undecidable problem, you get many. By a standard reduction technique, you can show:

- It is undecidable whether two given programs compute the same function.
- It is undecidable whether a given Diophantine equation $p(x_1, \\ldots, x_n) = 0$ with integer coefficients has an integer solution (**Hilbert's 10th problem**, settled by Matiyasevich, 1970).
- It is undecidable whether a given mathematical statement in first-order logic over the integers is true.

There are well-posed yes/no questions about numbers that no algorithm — and, granting the Church–Turing thesis, *no possible procedure* — can answer.

## The arc

We began the course with counting on our fingers. We end it with the discovery that some questions about the integers are mechanically unanswerable. The reach of mathematics is enormous; its limits are sharp; and the proofs that establish those limits use the same handful of conceptual moves — quantification, self-reference, diagonalization — that we have met again and again. *That* is conceptual mathematics.`,
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

const ASSIGNMENTS: SeedAssignment[] = [
  // ───────────── Week 1 ─────────────
  {
    kind: "homework",
    title: "Homework 1.1 — Numbers and their extensions",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on counting, rationals, irrationals, and the reals. Use the math keyboard for the blackboard-bold number sets (ℕ, ℤ, ℚ, ℝ, ℂ) and any symbols.",
    problems: [
      {
        topicSlug: "counting-integers-numberline",
        prompt:
          "Using ∈ and ∉, write two true membership statements: one placing −7 in the integers, and one excluding −7 from the natural numbers ℕ = {1, 2, 3, …}.",
        correctAnswer: "−7 ∈ ℤ and −7 ∉ ℕ",
        explanation:
          "$-7 \\in \\mathbb{Z}$ (it is an integer), and $-7 \\notin \\mathbb{N}$ under the convention $\\mathbb{N} = \\{1, 2, 3, \\ldots\\}$.",
      },
      {
        topicSlug: "rationals-ratios",
        prompt:
          "Using set-builder notation, write the definition of the rational numbers ℚ as ratios of integers (be sure to exclude the impossible denominator).",
        correctAnswer: "ℚ = { p/q : p, q ∈ ℤ, q ≠ 0 }",
        explanation:
          "$\\mathbb{Q} = \\{\\,p/q : p, q \\in \\mathbb{Z},\\ q \\neq 0\\,\\}$. Excluding $q = 0$ is essential — division by zero is undefined.",
      },
      {
        topicSlug: "irrationals-sqrt2",
        prompt:
          "State, in symbols, the membership claim that √2 is real but not rational. Use ∈, ∉, ℝ, ℚ.",
        correctAnswer: "√2 ∈ ℝ and √2 ∉ ℚ",
        explanation:
          "$\\sqrt 2 \\in \\mathbb{R}$ but $\\sqrt 2 \\notin \\mathbb{Q}$ — proven by the classical contradiction argument from $\\sqrt 2 = p/q$ in lowest terms.",
      },
      {
        topicSlug: "reals-completeness",
        prompt:
          "Write the chain of strict subset inclusions from the natural numbers up through the complex numbers (use ⊂ to indicate proper subsets).",
        correctAnswer: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ",
        explanation:
          "$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}$. Each inclusion is strict — each extension is genuinely larger.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Complex numbers, representation, infinity",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for i, π, exponents, and blackboard-bold set symbols.",
    problems: [
      {
        topicSlug: "complex-rotations",
        prompt:
          "Write the defining equation of the imaginary unit i, and then write Euler's identity (the special case linking 0, 1, π, e, and i).",
        correctAnswer: "i² = −1; e^{iπ} + 1 = 0",
        explanation:
          "$i^2 = -1$ defines the imaginary unit. Euler's identity $e^{i\\pi} + 1 = 0$ links five fundamental constants in a single equation.",
      },
      {
        topicSlug: "zero-negatives-leaps",
        prompt:
          "For each of the equations x + 1 = 0, 2x = 1, x² = 2, x² + 1 = 0, give the smallest standard number system (use ℕ, ℤ, ℚ, ℝ, ℂ) in which the equation has a solution.",
        correctAnswer:
          "x + 1 = 0 → ℤ; 2x = 1 → ℚ; x² = 2 → ℝ; x² + 1 = 0 → ℂ",
        explanation:
          "Each enlargement of the number system was driven by an equation the previous system could not solve.",
      },
      {
        topicSlug: "bases-place-value",
        prompt:
          "Write the number seventeen (a) in base 10, (b) in base 2, and (c) in base 16.",
        correctAnswer: "(a) 17, (b) 10001, (c) 11",
        explanation:
          "$17_{10} = 10001_2 = 11_{16}$. The number is the same; only the representation changes with the base.",
      },
      {
        topicSlug: "countable-uncountable",
        prompt:
          "Using ∼ for 'has the same cardinality as', write two true statements: (a) that the integers and the rationals are equinumerous, and (b) that the reals are *not* equinumerous with the naturals.",
        correctAnswer: "ℤ ∼ ℚ and ℝ ≁ ℕ",
        explanation:
          "$\\mathbb{Z}$ and $\\mathbb{Q}$ are both countable (cardinality $\\aleph_0$), so $\\mathbb{Z} \\sim \\mathbb{Q}$. By Cantor's diagonal argument, $\\mathbb{R}$ is uncountable, so $\\mathbb{R} \\not\\sim \\mathbb{N}$.",
      },
    ],
  },
  {
    kind: "test",
    title: "Week 1 Test — The number systems",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Math keyboard available; pasting is disabled. Answers should be written in compact symbolic form using the on-screen math keyboard.",
    problems: [
      {
        topicSlug: "counting-integers-numberline",
        prompt:
          "Using a single statement, write that the integers are closed under subtraction but the natural numbers are not. (Give a specific counterexample for ℕ.)",
        correctAnswer: "∀ a, b ∈ ℤ, a − b ∈ ℤ; but 3 − 5 = −2 ∉ ℕ",
        explanation:
          "For all $a, b \\in \\mathbb{Z}$, $a - b \\in \\mathbb{Z}$. But $3 - 5 = -2 \\notin \\mathbb{N}$ shows $\\mathbb{N}$ is not closed under subtraction.",
      },
      {
        topicSlug: "irrationals-sqrt2",
        prompt:
          "Outline the proof that √2 ∉ ℚ as a contradiction: state the assumption, the algebraic consequence, and the contradiction reached.",
        correctAnswer:
          "Assume √2 = p/q in lowest terms ⇒ p² = 2q² ⇒ p even ⇒ p = 2k ⇒ q² = 2k² ⇒ q even ⇒ p, q share factor 2, contradicting 'lowest terms'.",
        explanation:
          "Assume $\\sqrt 2 = p/q$ in lowest terms. Then $p^2 = 2q^2$, so $p$ is even, $p = 2k$, then $q^2 = 2k^2$, so $q$ is even — contradicting 'lowest terms.'",
      },
      {
        topicSlug: "reals-completeness",
        prompt:
          "State the Least Upper Bound (supremum) property of ℝ in symbols.",
        correctAnswer:
          "∀ S ⊆ ℝ with S ≠ ∅ and S bounded above, ∃ sup(S) ∈ ℝ",
        explanation:
          "Every nonempty subset $S \\subseteq \\mathbb{R}$ with an upper bound has a least upper bound $\\sup(S) \\in \\mathbb{R}$. This property fails in $\\mathbb{Q}$.",
      },
      {
        topicSlug: "complex-rotations",
        prompt:
          "Using i, write the two complex square roots of −9.",
        correctAnswer: "±3i",
        explanation:
          "$x^2 = -9 \\Rightarrow x = \\pm 3i$, since $(3i)^2 = 9 \\cdot i^2 = -9$.",
      },
      {
        topicSlug: "countable-uncountable",
        prompt:
          "Using ℵ₀, write the cardinality of ℚ and a strict inequality showing |ℝ| is larger.",
        correctAnswer: "|ℚ| = ℵ₀ and |ℝ| > ℵ₀",
        explanation:
          "$|\\mathbb{Q}| = \\aleph_0$ (the rationals are countable). $|\\mathbb{R}| > \\aleph_0$ by Cantor's diagonal argument; $|\\mathbb{R}| = 2^{\\aleph_0}$.",
      },
    ],
  },

  // ───────────── Week 2 ─────────────
  {
    kind: "homework",
    title: "Homework 2.1 — Operations, structural laws, groups",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ∀, ∃, ∈, ∘, and any operator symbols.",
    problems: [
      {
        topicSlug: "what-is-operation",
        prompt:
          "Using the function-arrow notation, write the formal definition of a binary operation ∗ on a set S.",
        correctAnswer: "∗ : S × S → S",
        explanation:
          "$\\ast : S \\times S \\to S$. The codomain $S$ encodes the closure requirement: combining two elements of $S$ must produce an element of $S$.",
      },
      {
        topicSlug: "commutative-associative-distributive",
        prompt:
          "Using ∀, write the commutative law for an operation ∗ on a set S, and the associative law for the same ∗.",
        correctAnswer:
          "∀ a, b ∈ S, a ∗ b = b ∗ a; ∀ a, b, c ∈ S, (a ∗ b) ∗ c = a ∗ (b ∗ c)",
        explanation:
          "Commutativity: $\\forall a, b \\in S,\\ a \\ast b = b \\ast a$. Associativity: $\\forall a, b, c \\in S,\\ (a \\ast b) \\ast c = a \\ast (b \\ast c)$.",
      },
      {
        topicSlug: "groups-symmetry",
        prompt:
          "List the four axioms a set G with operation ∗ must satisfy to be a group. Use compact symbolic notation (closure, associativity, identity, inverses).",
        correctAnswer:
          "(1) ∀ a, b ∈ G, a∗b ∈ G; (2) ∀ a, b, c, (a∗b)∗c = a∗(b∗c); (3) ∃ e ∈ G, ∀ a, e∗a = a∗e = a; (4) ∀ a ∈ G, ∃ a⁻¹ ∈ G, a∗a⁻¹ = a⁻¹∗a = e",
        explanation:
          "Closure, associativity, identity element $e$, inverses. An abelian group additionally satisfies $a \\ast b = b \\ast a$.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — Rings, fields, vector spaces, functions, modular arithmetic",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for blackboard-bold sets, ∀/∃, ≡, ∘, ∈, ∉.",
    problems: [
      {
        topicSlug: "rings-fields",
        prompt:
          "Give the precise condition on the positive integer n for the ring ℤ/nℤ to be a field. State it as a single sentence in symbols.",
        correctAnswer: "ℤ/nℤ is a field ⟺ n is prime",
        explanation:
          "$\\mathbb{Z}/n\\mathbb{Z}$ is a field if and only if $n$ is prime. For composite $n = ab$ with $1 < a, b < n$, the classes $[a]$ and $[b]$ are nonzero zero-divisors and have no multiplicative inverses.",
      },
      {
        topicSlug: "vector-spaces",
        prompt:
          "Using Σ notation, write the general form of a linear combination of vectors v₁, …, vₖ with scalars α₁, …, αₖ from a field F.",
        correctAnswer: "Σ_{i=1}^{k} α_i v_i",
        explanation:
          "A linear combination is $\\sum_{i=1}^{k} \\alpha_i v_i$, with each $\\alpha_i \\in F$ and each $v_i$ a vector. The span of $\\{v_1, \\ldots, v_k\\}$ is the set of all such combinations.",
      },
      {
        topicSlug: "functions-mappings",
        prompt:
          "Using ∀ and ⇒, write the formal definition that a function f : A → B is injective.",
        correctAnswer: "∀ a₁, a₂ ∈ A, f(a₁) = f(a₂) ⇒ a₁ = a₂",
        explanation:
          "$f$ is injective iff $\\forall a_1, a_2 \\in A,\\ f(a_1) = f(a_2) \\Rightarrow a_1 = a_2$. Equivalently: different inputs give different outputs.",
      },
      {
        topicSlug: "relations-equivalence-iso",
        prompt:
          "List the three properties (in symbols) that a relation ∼ on a set S must satisfy to be an equivalence relation.",
        correctAnswer:
          "Reflexive: ∀ a, a ∼ a. Symmetric: ∀ a, b, a ∼ b ⇒ b ∼ a. Transitive: ∀ a, b, c, (a ∼ b ∧ b ∼ c) ⇒ a ∼ c.",
        explanation:
          "Reflexivity, symmetry, transitivity. An equivalence relation partitions $S$ into disjoint equivalence classes.",
      },
      {
        topicSlug: "modular-arithmetic",
        prompt:
          "Using the ≡ ... (mod n) notation, write Fermat's Little Theorem for a prime p and an integer a not divisible by p.",
        correctAnswer: "a^{p−1} ≡ 1 (mod p)",
        explanation:
          "Fermat's Little Theorem: $a^{p-1} \\equiv 1 \\pmod p$ when $\\gcd(a, p) = 1$. It is the foundation of probabilistic primality testing and RSA encryption.",
      },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Weeks 1 & 2",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 60,
    instructions:
      "Cumulative midterm on the number systems and on algebraic structures. 60 minutes. Math keyboard available; pasting disabled.",
    problems: [
      {
        topicSlug: "rationals-ratios",
        prompt:
          "Using set-builder notation, write the definition of ℚ as ratios of integers.",
        correctAnswer: "ℚ = { p/q : p, q ∈ ℤ, q ≠ 0 }",
        explanation:
          "$\\mathbb{Q} = \\{\\,p/q : p, q \\in \\mathbb{Z},\\ q \\neq 0\\,\\}$.",
      },
      {
        topicSlug: "irrationals-sqrt2",
        prompt:
          "Write the membership claim that √2 is real but not rational.",
        correctAnswer: "√2 ∈ ℝ and √2 ∉ ℚ",
        explanation:
          "$\\sqrt 2 \\in \\mathbb{R}$ and $\\sqrt 2 \\notin \\mathbb{Q}$.",
      },
      {
        topicSlug: "complex-rotations",
        prompt:
          "State the defining equation of the imaginary unit i and write Euler's identity.",
        correctAnswer: "i² = −1; e^{iπ} + 1 = 0",
        explanation:
          "$i^2 = -1$ and $e^{i\\pi} + 1 = 0$.",
      },
      {
        topicSlug: "countable-uncountable",
        prompt:
          "Using ℵ₀, write the cardinality of ℕ. Then write a strict inequality comparing |ℕ| and |ℝ|.",
        correctAnswer: "|ℕ| = ℵ₀ and |ℕ| < |ℝ|",
        explanation:
          "$|\\mathbb{N}| = \\aleph_0$ and $|\\mathbb{N}| < |\\mathbb{R}|$ (Cantor).",
      },
      {
        topicSlug: "groups-symmetry",
        prompt:
          "Using ∃ and ∀, state the identity-element axiom and the inverses axiom for a group (G, ∗).",
        correctAnswer:
          "∃ e ∈ G, ∀ a ∈ G, e ∗ a = a ∗ e = a; and ∀ a ∈ G, ∃ a⁻¹ ∈ G, a ∗ a⁻¹ = a⁻¹ ∗ a = e",
        explanation:
          "Identity: $\\exists e,\\ \\forall a,\\ e \\ast a = a \\ast e = a$. Inverses: $\\forall a,\\ \\exists a^{-1},\\ a \\ast a^{-1} = a^{-1} \\ast a = e$.",
      },
      {
        topicSlug: "rings-fields",
        prompt:
          "State the condition on n for ℤ/nℤ to be a field.",
        correctAnswer: "ℤ/nℤ is a field ⟺ n is prime",
        explanation:
          "$\\mathbb{Z}/n\\mathbb{Z}$ is a field iff $n$ is prime.",
      },
      {
        topicSlug: "vector-spaces",
        prompt:
          "Using Σ, write the linear combination of v₁, v₂, v₃ with scalars α₁, α₂, α₃.",
        correctAnswer: "Σ_{i=1}^{3} α_i v_i = α₁v₁ + α₂v₂ + α₃v₃",
        explanation:
          "$\\sum_{i=1}^{3} \\alpha_i v_i$.",
      },
      {
        topicSlug: "modular-arithmetic",
        prompt:
          "Using the ≡ ... (mod n) notation, write Fermat's Little Theorem.",
        correctAnswer: "a^{p−1} ≡ 1 (mod p) when gcd(a, p) = 1",
        explanation:
          "$a^{p-1} \\equiv 1 \\pmod p$ for prime $p$ and $\\gcd(a, p) = 1$.",
      },
    ],
  },

  // ───────────── Week 3 ─────────────
  {
    kind: "homework",
    title: "Homework 3.1 — Limits, continuity, derivatives, integrals",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for limits, derivatives, integrals, and quantifiers.",
    problems: [
      {
        topicSlug: "limits-taming-infinity",
        prompt:
          "Write the ε–δ definition of lim_{x → a} f(x) = L using ∀, ∃, and |·|.",
        correctAnswer:
          "∀ ε > 0, ∃ δ > 0 : 0 < |x − a| < δ ⇒ |f(x) − L| < ε",
        explanation:
          "$\\forall \\varepsilon > 0,\\ \\exists \\delta > 0$ such that $0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon$.",
      },
      {
        topicSlug: "continuity",
        prompt:
          "State, as a single equation, the definition that a function f is continuous at the point a.",
        correctAnswer: "lim_{x → a} f(x) = f(a)",
        explanation:
          "$f$ is continuous at $a$ iff $\\lim_{x \\to a} f(x) = f(a)$ — meaning the limit exists, $f(a)$ exists, and the two are equal.",
      },
      {
        topicSlug: "derivatives-instantaneous-rate",
        prompt:
          "Using a limit, write the definition of the derivative f'(a).",
        correctAnswer: "f'(a) = lim_{h → 0} (f(a + h) − f(a)) / h",
        explanation:
          "$f'(a) = \\lim_{h \\to 0} \\dfrac{f(a+h) - f(a)}{h}$, when the limit exists.",
      },
      {
        topicSlug: "integrals-accumulation",
        prompt:
          "Using ∫, write the definite integral of f from a to b. Include the dx.",
        correctAnswer: "∫_a^b f(x) dx",
        explanation:
          "$\\int_a^b f(x)\\,\\mathrm{d}x$. The $\\mathrm{d}x$ is the limit of the rectangle widths in the Riemann sum.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — FTC, series, geometry, topology",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Use the math keyboard freely.",
    problems: [
      {
        topicSlug: "ftc",
        prompt:
          "State Part 2 of the Fundamental Theorem of Calculus: if F' = f on [a, b], express ∫_a^b f(x) dx in terms of F.",
        correctAnswer: "∫_a^b f(x) dx = F(b) − F(a)",
        explanation:
          "$\\int_a^b f(x)\\,\\mathrm{d}x = F(b) - F(a)$ for any antiderivative $F$ of $f$.",
      },
      {
        topicSlug: "sequences-series-zeno",
        prompt:
          "Using Σ, write the closed-form sum of the infinite geometric series 1 + r + r² + r³ + ⋯ when |r| < 1.",
        correctAnswer: "Σ_{n=0}^{∞} r^n = 1 / (1 − r), valid for |r| < 1",
        explanation:
          "$\\sum_{n=0}^{\\infty} r^n = \\dfrac{1}{1 - r}$ when $|r| < 1$. This is the resolution of Zeno's paradox: infinitely many shrinking steps sum to a finite total.",
      },
      {
        topicSlug: "euclidean-non-euclidean",
        prompt:
          "For a triangle on a sphere of constant positive curvature, write an inequality comparing the sum of its interior angles to π.",
        correctAnswer: "α + β + γ > π",
        explanation:
          "On a sphere (positive curvature), the angle sum of any triangle exceeds $\\pi$. On a hyperbolic surface (negative curvature), the sum is less than $\\pi$. Only in Euclidean geometry is the sum exactly $\\pi$.",
      },
      {
        topicSlug: "topology-dimension-curvature",
        prompt:
          "Using V, E, F, write the Euler characteristic χ of a polyhedron, and give its value for any triangulation of the sphere.",
        correctAnswer: "χ = V − E + F; for the sphere, χ = 2",
        explanation:
          "$\\chi = V - E + F$. For any triangulation of the sphere, $\\chi = 2$ (Euler, 1758). For the torus, $\\chi = 0$.",
      },
    ],
  },
  {
    kind: "test",
    title: "Week 3 Test — Calculus, geometry, topology",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 40,
    instructions: "Timed. 40 minutes. Math keyboard available; pasting disabled.",
    problems: [
      {
        topicSlug: "limits-taming-infinity",
        prompt:
          "Write the ε–δ definition of lim_{x → a} f(x) = L.",
        correctAnswer:
          "∀ ε > 0, ∃ δ > 0 : 0 < |x − a| < δ ⇒ |f(x) − L| < ε",
        explanation:
          "$\\forall \\varepsilon > 0,\\ \\exists \\delta > 0 : 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon$.",
      },
      {
        topicSlug: "derivatives-instantaneous-rate",
        prompt:
          "Using a limit, write the definition of f'(a).",
        correctAnswer: "f'(a) = lim_{h → 0} (f(a + h) − f(a)) / h",
        explanation:
          "$f'(a) = \\lim_{h \\to 0} \\dfrac{f(a+h) - f(a)}{h}$.",
      },
      {
        topicSlug: "ftc",
        prompt:
          "State the Fundamental Theorem of Calculus Part 2 in symbols.",
        correctAnswer: "If F' = f on [a, b], then ∫_a^b f(x) dx = F(b) − F(a)",
        explanation:
          "$\\int_a^b f(x)\\,\\mathrm{d}x = F(b) - F(a)$.",
      },
      {
        topicSlug: "sequences-series-zeno",
        prompt:
          "Sum the geometric series Σ_{n=0}^{∞} (1/2)^n.",
        correctAnswer: "Σ_{n=0}^{∞} (1/2)^n = 1/(1 − 1/2) = 2",
        explanation:
          "$\\sum_{n=0}^{\\infty} (1/2)^n = \\dfrac{1}{1 - 1/2} = 2$.",
      },
      {
        topicSlug: "topology-dimension-curvature",
        prompt:
          "Give the Euler characteristic of (a) a sphere and (b) a torus.",
        correctAnswer: "(a) χ = 2; (b) χ = 0",
        explanation:
          "Sphere: $\\chi = 2$. Torus: $\\chi = 0$. Each is a topological invariant.",
      },
    ],
  },

  // ───────────── Week 4 ─────────────
  {
    kind: "homework",
    title: "Homework 4.1 — Logic, proof, induction, sets",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ∀, ∃, ∧, ∨, ¬, →, ↔, ∈, ∉.",
    problems: [
      {
        topicSlug: "propositional-predicate-logic",
        prompt:
          "Using ¬, ∀, and ∃, write the equivalences that negate a universal and an existential statement.",
        correctAnswer:
          "¬(∀ x, P(x)) ≡ ∃ x, ¬P(x); ¬(∃ x, P(x)) ≡ ∀ x, ¬P(x)",
        explanation:
          "$\\neg(\\forall x\\, P(x)) \\equiv \\exists x\\, \\neg P(x)$; $\\neg(\\exists x\\, P(x)) \\equiv \\forall x\\, \\neg P(x)$. The negation of 'every swan is white' is 'some swan is not white'.",
      },
      {
        topicSlug: "what-is-proof",
        prompt:
          "State, in symbols, the inference rule modus ponens (from P and P → Q, conclude Q) and the rule modus tollens.",
        correctAnswer:
          "Modus ponens: P, P → Q ⊢ Q. Modus tollens: P → Q, ¬Q ⊢ ¬P.",
        explanation:
          "Modus ponens: $P,\\ P \\to Q \\vdash Q$. Modus tollens: $P \\to Q,\\ \\neg Q \\vdash \\neg P$. Both are fundamental inference rules.",
      },
      {
        topicSlug: "mathematical-induction",
        prompt:
          "Using Σ, write the closed-form formula for the sum of the first n positive integers, which is the classical example proven by induction.",
        correctAnswer: "Σ_{k=1}^{n} k = n(n + 1) / 2",
        explanation:
          "$\\sum_{k=1}^{n} k = \\dfrac{n(n+1)}{2}$. Proven by induction: base $n = 1$ gives $1 = 1$; step uses $\\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}$.",
      },
      {
        topicSlug: "sets-russell-paradox",
        prompt:
          "Using set-builder notation, write Russell's set R — the set of all sets that are not members of themselves.",
        correctAnswer: "R = { x : x ∉ x }",
        explanation:
          "$R = \\{\\,x : x \\notin x\\,\\}$. The question 'is $R \\in R$?' yields a contradiction either way, which is why naive (unrestricted-comprehension) set theory is inconsistent.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Independence, Gödel, probability, computability",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Use the math keyboard for ℵ, ∈, ∪, Σ, ≥.",
    problems: [
      {
        topicSlug: "axioms-independence",
        prompt:
          "Using ℵ-notation, write the Continuum Hypothesis as an equation, and state in words what its independence from ZFC means.",
        correctAnswer:
          "CH: |ℝ| = ℵ₁. Independence: neither CH nor ¬CH is provable from ZFC (Gödel 1940, Cohen 1963).",
        explanation:
          "$|\\mathbb{R}| = \\aleph_1$ is the CH. Gödel showed ZFC + CH is consistent (1940); Cohen showed ZFC + ¬CH is also consistent (1963). So CH is independent of ZFC.",
      },
      {
        topicSlug: "godel-incompleteness",
        prompt:
          "State Gödel's First Incompleteness Theorem in one sentence: for any sufficiently strong consistent effective system T, what must exist?",
        correctAnswer:
          "There exists a statement G in the language of T such that G is true but T does not prove G and T does not prove ¬G.",
        explanation:
          "Any sufficiently strong consistent effective axiom system $T$ contains a sentence $G$ that is true (in the standard model) but neither $G$ nor $\\neg G$ is provable in $T$.",
      },
      {
        topicSlug: "probability-foundations",
        prompt:
          "State Kolmogorov's three axioms of probability for a probability measure P on a sample space Ω with σ-algebra ℱ.",
        correctAnswer:
          "(1) P(Ω) = 1; (2) P(A) ≥ 0 for all A ∈ ℱ; (3) for disjoint A₁, A₂, … ∈ ℱ, P(⋃_n A_n) = Σ_n P(A_n).",
        explanation:
          "Normalization $P(\\Omega) = 1$, non-negativity $P(A) \\ge 0$, and countable additivity $P(\\bigcup_n A_n) = \\sum_n P(A_n)$ for disjoint events.",
      },
      {
        topicSlug: "computability-halting",
        prompt:
          "State the halting problem and Turing's headline result about it (in one sentence each).",
        correctAnswer:
          "Halting problem: given a Turing machine M and input x, does M halt on x? Turing's theorem: no algorithm decides the halting problem — it is undecidable.",
        explanation:
          "The halting problem is undecidable: there is no Turing machine $H$ that, given $\\langle M, x \\rangle$, always correctly outputs whether $M$ halts on $x$. Proved by diagonalization.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — Conceptual mathematics",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 90,
    instructions:
      "Cumulative final covering all four weeks. 90 minutes. Math keyboard available; pasting disabled.",
    problems: [
      {
        topicSlug: "rationals-ratios",
        prompt:
          "Using set-builder notation, write the definition of ℚ.",
        correctAnswer: "ℚ = { p/q : p, q ∈ ℤ, q ≠ 0 }",
        explanation:
          "$\\mathbb{Q} = \\{\\,p/q : p, q \\in \\mathbb{Z},\\ q \\neq 0\\,\\}$.",
      },
      {
        topicSlug: "countable-uncountable",
        prompt:
          "Using ℵ₀, compare the cardinalities of ℚ and ℝ with a strict inequality.",
        correctAnswer: "|ℚ| = ℵ₀ < |ℝ|",
        explanation:
          "$|\\mathbb{Q}| = \\aleph_0 < |\\mathbb{R}|$. The rationals are countable, the reals are not.",
      },
      {
        topicSlug: "groups-symmetry",
        prompt:
          "Using ∃ and ∀, state the identity-element axiom for a group (G, ∗).",
        correctAnswer: "∃ e ∈ G, ∀ a ∈ G, e ∗ a = a ∗ e = a",
        explanation:
          "$\\exists e \\in G,\\ \\forall a \\in G,\\ e \\ast a = a \\ast e = a$.",
      },
      {
        topicSlug: "modular-arithmetic",
        prompt:
          "Using ≡ … (mod n), write Fermat's Little Theorem.",
        correctAnswer: "a^{p−1} ≡ 1 (mod p), for prime p and gcd(a, p) = 1",
        explanation:
          "$a^{p-1} \\equiv 1 \\pmod p$ for prime $p$ and $\\gcd(a, p) = 1$.",
      },
      {
        topicSlug: "limits-taming-infinity",
        prompt:
          "Write the ε–δ definition of lim_{x → a} f(x) = L.",
        correctAnswer:
          "∀ ε > 0, ∃ δ > 0 : 0 < |x − a| < δ ⇒ |f(x) − L| < ε",
        explanation:
          "$\\forall \\varepsilon > 0,\\ \\exists \\delta > 0 : 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon$.",
      },
      {
        topicSlug: "ftc",
        prompt:
          "State Part 2 of the Fundamental Theorem of Calculus in symbols.",
        correctAnswer: "If F' = f on [a, b], then ∫_a^b f(x) dx = F(b) − F(a)",
        explanation:
          "$\\int_a^b f(x)\\,\\mathrm{d}x = F(b) - F(a)$ for any antiderivative $F$ of $f$.",
      },
      {
        topicSlug: "sequences-series-zeno",
        prompt:
          "Using Σ, write the closed form of the geometric series Σ_{n=0}^{∞} r^n for |r| < 1.",
        correctAnswer: "Σ_{n=0}^{∞} r^n = 1 / (1 − r)",
        explanation:
          "$\\sum_{n=0}^{\\infty} r^n = \\dfrac{1}{1 - r}$ for $|r| < 1$.",
      },
      {
        topicSlug: "mathematical-induction",
        prompt:
          "Using Σ, write the closed-form formula proved by the classical induction example: the sum of 1 through n.",
        correctAnswer: "Σ_{k=1}^{n} k = n(n + 1) / 2",
        explanation:
          "$\\sum_{k=1}^{n} k = \\dfrac{n(n+1)}{2}$.",
      },
      {
        topicSlug: "sets-russell-paradox",
        prompt:
          "Using set-builder notation, write Russell's set R that produces the paradox.",
        correctAnswer: "R = { x : x ∉ x }",
        explanation:
          "$R = \\{\\,x : x \\notin x\\,\\}$. Asking whether $R \\in R$ yields a contradiction either way.",
      },
      {
        topicSlug: "godel-incompleteness",
        prompt:
          "State Gödel's First Incompleteness Theorem in one sentence.",
        correctAnswer:
          "Any sufficiently strong consistent effective formal system T contains a true statement G such that T proves neither G nor ¬G.",
        explanation:
          "Any consistent effective axiom system capable of encoding arithmetic is incomplete: there is a true statement $G$ that is not provable in the system.",
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
const CONTENT_REVISION = "2026-05-27.conceptual-math.r1";

// A sentinel phrase present in exactly one lecture body — used to detect that
// the database holds the *current* revision of the content (not just a set of
// matching slugs). Bump whenever the seed content is overhauled.
const REVISION_SENTINEL_SLUG = "counting-integers-numberline";
const REVISION_SENTINEL_PHRASE = "John Wallis popularized the picture of integers";

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
