/* global d3 */


// RUN THE WEB SERVER WITH THE COMMAND: 'live-server --port=1234 --open=public --entry-file=index.html'
// https://eager-almeida-27238f.netlify.app/

const svg = d3.select("svg");
const margin = {top: 20, right: 20, bottom: 100, left: 80};
const x = d3.scaleBand().padding(0.1);
const y = d3.scaleLinear();
let theData;

const g = svg.append("g")
  .attr("transform", `translate(${  margin.left  },${  margin.top  })`);

const color = d3.scaleOrdinal(d3.schemeCategory10);

g.append("g")
  .attr("class", "axis axis--x");

g.append("g")
  .attr("class", "axis axis--y");

g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -60)
  .attr("dy", "0.70em")
  .attr("text-anchor", "end")
  .text("Wealth ($Billion)");

function convertStringToNumber(str) {
  const med = (str.split(',').join(''));
  return Number(med.split('$').join(''));
}

function create(csvFile) {

  d3.csv(csvFile, d => {
    d.Wealth = convertStringToNumber(d.Wealth);
    return d;

  }, (error, data) => {
    if (error) throw error;

    theData = data;

    x.domain(theData.map(d => { return d.Country; }));
    y.domain([0, d3.max(theData, d => { return d.Wealth; })]);

    const bounds = svg.node().getBoundingClientRect();
    const width = bounds.width - margin.left - margin.right;
    const height = bounds.height - margin.top - margin.bottom;

    x.rangeRound([0, width]);
    y.rangeRound([height, 0]);

    g.select(".axis--x")
      .attr("transform", `translate(0,${  height  })`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(90)")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start");

    g.select(".axis--y")
      .call(d3.axisLeft(y));

    const bars = g.selectAll(".bar")
      .data(theData);

    const div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    bars
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => { return x(d.Country); })
      .attr("y", d => { return y(d.Wealth); })
      .attr("width", x.bandwidth())
      .attr("height", d => { return height - y(d.Wealth); })
      .style('fill', (d) => color(d.Region))
      .on('mouseover', (d) => {
        div.transition()
          .duration(50)
          .style("opacity", 1);
        const num = `${((d.Wealth / 360474) * 100).toFixed(3).toString()  }%`;
        div.html(num)
          .style("left", `${d3.event.pageX + 5  }px`)
          .style("top", `${d3.event.pageY - 10  }px`);
      })
      .on('mouseout', (d) => {
        div.transition()
          .duration('50')
          .style("opacity", 0);
      });

    svg.append('text')
      .attr('x', 180)
      .attr('y', 30)
      .attr('class', 'title')
      .style('font-size', '20px')
      .style('text-decoration', 'underline')
      .text('Top 55 Countries by Total Wealth (2019)');

    const legend = svg.selectAll('legend')
      .data(color.domain())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    svg.append('text')
      .attr('x', 550)
      .attr('y', 80)
      .attr('class', 'title')
      .style('font-size', '17px')
      .style('text-decoration', 'underline')
      .text('Region:');

    legend.append('rect')
      .attr('x', 600)
      .attr('y', 90)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.append('text')
      .attr('x', 595)
      .attr('y', 100)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text((d) => d);

    bars.attr("x", d => { return x(d.Country); })
      .attr("y", d => { return y(d.Wealth); })
      .attr("width", x.bandwidth())
      .attr("height", d => { return height - y(d.Wealth); });

    bars.exit()
      .remove();

  });
}

create("WorldWealth.csv");
