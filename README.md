# BiDex-100

A simulation benchmark for **bimanual dexterous manipulation**: 106 declaratively
specified tasks across five capability axes — *Generalization*, *Instruction-Following*,
*Limited-Demonstrations*, *Long-Horizon*, and *Memory* — with progress-based predicate
scoring, matched In-Domain / Out-of-Domain evaluation, two 22-DoF hand embodiments, and
**8,080 success-validated teleoperated demonstrations** (6.25M frames).

We evaluate seven recent Vision-Language-Action models under a unified protocol,
establishing baselines for capability-specific performance, robustness, and data
efficiency.

## Resources

- 🌐 **Project page (this site):** see `index.html` (served from the `gh-pages` branch).
- 💻 **Code, tasks & evaluation tooling:** https://github.com/BiDex-100/BiDex-100
- 📊 **Leaderboard:** on the [project page](https://github.com/BiDex-100/BiDex-100) → *Leaderboard*.
- 📦 **Teleoperation data (8,080 episodes):** https://huggingface.co/datasets/BiDex-100/BiDex-100-Data
- 🧱 **Object asset library (~300 assets):** https://huggingface.co/datasets/BiDex-100/BiDex-100-Assets

## Citation

```bibtex
@misc{bidex100,
  title         = {BiDex-100: A Comprehensive Benchmark for Bimanual Dexterous Manipulation Across 100+ Simulation Tasks},
  year          = {2025},
  howpublished  = {https://github.com/BiDex-100/BiDex-100},
}
```
