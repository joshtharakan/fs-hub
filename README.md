# FS Hub

### Short description

Building a digital sports engagement hub, commonly referred to as Fantasy Sports (FS), as a modular and sufficiently decentralised solution. This is achieved using a collection of individual ephemeral micro-rollups representing each real-life match as events. These are built with Stackr SDK on top of AvailDA.

### Description

The project involves building a digital sports engagement hub (Fantasy Sports hub) utilising AvailDA’s expandable blobspace and constructing the core functionalities as micro-rollups with Stackr SDK. Fantasy Sports is a digital sports engagement platform, based entirely on real-life sports matches. Users build virtual teams based on a limited budget with proxies of real players participating in an upcoming event (match/tournament) and compete based on real-life statistical on-field performance, such as goals or runs, turning them into points. Users are ranked based on the performance during the sports match or the tournament.

### How it's made

Following service oriented architecture, micro-rollups are built using Stackr SDK. These benefit from the speed, efficiency, and cost-effectiveness of micro rollups (MRUs), all while maintaining the security and verifiability expected of blockchain-based solutions. Each real-world sport match is proxied as a fantasy sport event built as an ephemeral rollup MRU to be used as the scoring system based on the real match outcome.

Using AvailDA provides sufficiently enough blobspace that is cheap and does not compromise on the verifiability and security of the game outcomes. 

The use of MRUs helps to track real-time updates of the performance/ranking of sport players without the overhead of traditional blockchain transactions. It also allows for modular development and scalability. By isolating application states of each match as separate ephemeral rollup, we can efficiently manage data, prevent unsustainable state growth and ensure long-term scalability.


### References

| References | Notes |
| --- | --- |
| [Deloitte Fantasy Sports(FS) industry report](https://www2.deloitte.com/content/dam/Deloitte/in/Documents/technology-media-telecommunications/in-tmt-fantasy-sports-industry-report-noexp.pdf)  |  |
|  |  |